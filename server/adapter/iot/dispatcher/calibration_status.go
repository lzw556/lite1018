package dispatcher

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/process"
)

type CalibrationStatus struct {
	context   *iot.Context
	processor process.Processor
}

func NewCalibrationStatus() iot.Dispatcher {
	return &CalibrationStatus{
		context:   iot.NewContext(),
		processor: process.NewCalibrationStatus(),
	}
}

func (d CalibrationStatus) Name() string {
	return "calibrationStatus"
}

func (d CalibrationStatus) Dispatch(msg iot.Message) {
	process.Do(d.context, d.processor, msg)
}
