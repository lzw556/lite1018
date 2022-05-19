package process

import (
	"context"
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
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
			if device.Type == devicetype.GatewayType {
				devices, _ := p.deviceRepo.FindBySpecs(context.TODO(), spec.NetworkEqSpec(device.NetworkID))
				for i := range devices {
					e := devices[i]
					if state, err := p.deviceStateRepo.Get(e.MacAddress); err == nil {
						state.IsOnline = false
						state.ConnectedAt = time.Now().UTC().Unix()
						if err := p.deviceStateRepo.Create(e.MacAddress, state); err != nil {
							xlog.Errorf("update device state failed: %v => [%s]", err, e.MacAddress)
						}
						state.Notify(e.MacAddress)
						event := entity.Event{
							Code:      entity.EventCodeStatus,
							Category:  entity.EventCategoryDevice,
							SourceID:  e.ID,
							Timestamp: time.Now().Unix(),
							ProjectID: e.ProjectID,
						}
						event.Content = fmt.Sprintf(`{"code": %d}`, 102)
					}
					return nil
				}
			}
			event := entity.Event{
				Code:      entity.EventCodeStatus,
				Category:  entity.EventCategoryDevice,
				SourceID:  device.ID,
				Timestamp: time.Now().Unix(),
				ProjectID: device.ProjectID,
			}
			event.Content = fmt.Sprintf(`{"code": %d}`, 2)
			if err := p.eventResp.Create(context.TODO(), &event); err != nil {
				xlog.Errorf("create event failed: %v => [%s]", err, device.MacAddress)
			}
		}
	}
	return nil
}
