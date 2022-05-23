package process

import (
	"context"
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
	"sync"
	"time"
)

type Bye struct {
	deviceRepo           dependency.DeviceRepository
	eventResp            dependency.EventRepository
	deviceConnectionRepo dependency.DeviceConnectionStateRepository
}

func NewBye() Processor {
	return newRoot(&Bye{
		deviceRepo:           repository.Device{},
		eventResp:            repository.Event{},
		deviceConnectionRepo: repository.DeviceConnectionState{},
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
			connectionState, err := p.deviceConnectionRepo.Get(device.MacAddress)
			if err != nil {
				return err
			}
			if connectionState != nil {
				connectionState.SetStatus(entity.DeviceConnectionStatusOffline)
				err = p.deviceConnectionRepo.Update(device.MacAddress, connectionState)
				if err != nil {
					xlog.Errorf("update device connection state failed: %v => [%s]", err, device.MacAddress)
				}
			}
			go p.updateDevicesState(device)

		}
	}
	return nil
}

func (p Bye) updateDevicesState(gateway entity.Device) {
	devices, _ := p.deviceRepo.FindBySpecs(context.TODO(), spec.NetworkEqSpec(gateway.NetworkID))
	var wg sync.WaitGroup
	for i := range devices {
		wg.Add(1)
		go func(device entity.Device) {
			defer wg.Done()
			connectionState, err := p.deviceConnectionRepo.Get(device.MacAddress)
			if err != nil {
				xlog.Errorf("get device connection state failed: %v => [%s]", err, device.MacAddress)
				return
			}
			connectionState.SetStatus(entity.DeviceConnectionStatusOffline)
			if connectionState.IsStatusChanged {
				connectionState.Notify(device.MacAddress)
				event := entity.Event{
					Code:      entity.EventCodeStatus,
					Category:  entity.EventCategoryDevice,
					SourceID:  device.ID,
					Timestamp: time.Now().Unix(),
					ProjectID: device.ProjectID,
				}
				event.Content = fmt.Sprintf(`{"code": %d}`, 2)
				_ = p.eventResp.Create(context.TODO(), &event)
			}
			err = p.deviceConnectionRepo.Update(device.MacAddress, connectionState)
			if err != nil {
				xlog.Errorf("update device connection state failed: %v => [%s]", err, device.MacAddress)
			}
		}(devices[i])
	}
	wg.Wait()
}
