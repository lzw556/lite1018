package process

import (
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type CancelFirmware struct {
}

func NewCancelFirmware() Processor {
	return newRoot(&CancelFirmware{})
}

func (p CancelFirmware) Name() string {
	return "CancelFirmware"
}

func (p CancelFirmware) Next() Processor {
	return nil
}

func (p CancelFirmware) Process(ctx *iot.Context, msg iot.Message) error {
	if value, ok := ctx.Get(msg.Body.Device); ok {
		if device, ok := value.(entity.Device); ok {
			fmt.Println(device)
		}
	}
	return nil
}
