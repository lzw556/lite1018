package process

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
	"time"
)

type Bye struct {
	deviceStateRepo dependency.DeviceStateRepository
}

func NewBye() Processor {
	return newRoot(&Bye{
		deviceStateRepo: repository.DeviceState{},
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
		}
	}
	return nil
}
