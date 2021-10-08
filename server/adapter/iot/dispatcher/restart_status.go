package dispatcher

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/process"
)

type RestartStatus struct {
	context   *iot.Context
	processor process.Processor
}

func NewRestartStatus() RestartStatus {
	return RestartStatus{
		context:   iot.NewContext(),
		processor: process.NewRestartStatus(),
	}
}

func (RestartStatus) Name() string {
	return "restartStatus"
}

func (d RestartStatus) Dispatch(msg iot.Message) {
	process.Do(d.context, d.processor, msg)
}
