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
	deviceRepo      dependency.DeviceRepository
	deviceStateRepo dependency.DeviceStateRepository
	eventResp       dependency.EventRepository
}

func NewBye() Processor {
	return newRoot(&Bye{
		deviceRepo:      repository.Device{},
		deviceStateRepo: repository.DeviceState{},
		eventResp:       repository.Event{},
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
			if state, err := p.deviceStateRepo.Get(device.MacAddress); err == nil {
				state.IsOnline = false
				state.ConnectedAt = time.Now().UTC().Unix()
				if err := p.deviceStateRepo.Create(device.MacAddress, state); err != nil {
					xlog.Errorf("update device state failed: %v => [%s]", err, device.MacAddress)
				}
				state.Notify(device.MacAddress)
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
			state, _ := p.deviceStateRepo.Get(device.MacAddress)
			state.SetIsOnline(false)
			state.ConnectedAt = time.Now().Unix()
			if err := p.deviceStateRepo.Create(device.MacAddress, state); err != nil {
				xlog.Errorf("update device state failed: %v => [%s]", err, device.MacAddress)
			}
			if state.ConnectionStatusChanged {
				state.Notify(device.MacAddress)
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
		}(devices[i])
	}
	wg.Wait()
}
