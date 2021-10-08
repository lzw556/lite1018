package dispatcher

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/process"
)

type UpdateDeviceSettingsResponse struct {
	context   *iot.Context
	processor process.Processor
}

func NewUpdateDeviceSettingsResponse() UpdateDeviceSettingsResponse {
	return UpdateDeviceSettingsResponse{
		context:   iot.NewContext(),
		processor: process.NewGeneralResponse(),
	}
}

func (UpdateDeviceSettingsResponse) Name() string {
	return "updateDeviceSettingsResponse"
}

func (d UpdateDeviceSettingsResponse) Dispatch(msg iot.Message) {
	process.Do(d.context, d.processor, msg)
}
