package dispatcher

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/process"
)

type ResetResponse struct {
	context   *iot.Context
	processor process.Processor
}

func NewResetResponse() iot.Dispatcher {
	return ResetResponse{
		context:   iot.NewContext(),
		processor: process.NewGeneralResponse(),
	}
}

func (d ResetResponse) Name() string {
	return "resetDeviceSettingsResponse"
}

func (d ResetResponse) Dispatch(msg iot.Message) {
	process.Do(d.context, d.processor, msg)
}
