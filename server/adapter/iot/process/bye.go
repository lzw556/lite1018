package process

import (
	"context"
	"time"

	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/cache"
	"github.com/thetasensors/theta-cloud-lite/server/worker"
)

type Bye struct {
	deviceRepo dependency.DeviceRepository
	eventResp  dependency.EventRepository
}

func NewBye() Processor {
	return newRoot(&Bye{
		deviceRepo: repository.Device{},
		eventResp:  repository.Event{},
	})
}

func (p Bye) Name() string {
	return "Bye"
}

func (p Bye) Next() Processor {
	return nil
}

func (p Bye) Process(ctx *iot.Context, msg iot.Message) error {
	if value, ok := ctx.Get(msg.Body.Device); ok {
		if device, ok := value.(entity.Device); ok {
			if !device.IsNB() {
				go p.updateChildrenConnectionState(device)
			}
		}
	}
	return nil
}

func (p Bye) updateChildrenConnectionState(gateway entity.Device) {
	devices, _ := p.deviceRepo.FindBySpecs(context.TODO(), spec.NetworkEqSpec(gateway.NetworkID))
	macs := make([]string, 0)
	for _, device := range devices {
		macs = append(macs, device.MacAddress)
		event := entity.Event{
			Type:      entity.EventTypeDeviceStatus,
			Code:      2,
			Category:  entity.EventCategoryDevice,
			SourceID:  device.ID,
			Timestamp: time.Now().Unix(),
			ProjectID: device.ProjectID,
		}
		worker.EventsChan <- event
		device.NotifyConnectionState(false, time.Now().Unix())
	}
	cache.BatchDeleteConnections(macs...)
}
