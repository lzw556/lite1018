package dispatcher

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/process"
)

type CalibrateStatus struct {
	context   *iot.Context
	processor process.Processor
}

func NewCalibrateStatus() iot.Dispatcher {
	return &CalibrateStatus{
		context:   iot.NewContext(),
		processor: process.NewCalibrateStatus(),
	}
}

func (d CalibrateStatus) Name() string {
	return "calibrateStatus"
}

func (d CalibrateStatus) Dispatch(msg iot.Message) {
	process.Do(d.context, d.processor, msg)
}
