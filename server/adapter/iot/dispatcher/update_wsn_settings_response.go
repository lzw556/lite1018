package dispatcher

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/process"
)

type UpdateWsnSettingsResponse struct {
	context   *iot.Context
	processor process.Processor
}

func NewUpdateWsnSettingsResponse() UpdateWsnSettingsResponse {
	return UpdateWsnSettingsResponse{
		context:   iot.NewContext(),
		processor: process.NewGeneralResponse(),
	}
}

func (UpdateWsnSettingsResponse) Name() string {
	return "updateWsnSettingsResponse"
}

func (d UpdateWsnSettingsResponse) Dispatch(msg iot.Message) {
	process.Do(d.context, d.processor, msg)
}
