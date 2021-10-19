package dispatcher

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/process"
)

type UpdateDeviceListResponse struct {
	context   *iot.Context
	processor process.Processor
}

func NewUpdateDeviceListResponse() UpdateDeviceListResponse {
	return UpdateDeviceListResponse{
		context:   iot.NewContext(),
		processor: process.NewGeneralResponse(),
	}
}

func (d UpdateDeviceListResponse) Name() string {
	return "updateDeviceListResponse"
}

func (d UpdateDeviceListResponse) Dispatch(msg iot.Message) {
	process.Do(d.context, d.processor, msg)
}
