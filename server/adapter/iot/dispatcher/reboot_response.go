package dispatcher

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/process"
)

type RebootResponse struct {
	context   *iot.Context
	processor process.Processor
}

func NewRebootResponse() RebootResponse {
	return RebootResponse{
		context:   iot.NewContext(),
		processor: process.NewGeneralResponse(),
	}
}

func (RebootResponse) Name() string {
	return "rebootResponse"
}

func (d RebootResponse) Dispatch(msg iot.Message) {
	process.Do(d.context, d.processor, msg)
}
