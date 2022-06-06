package dispatcher

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/process"
)

type CalibrationStatus struct {
}

func NewCalibrationStatus() iot.Dispatcher {
	return &CalibrationStatus{}
}

func (d CalibrationStatus) Name() string {
	return "calibrationStatus"
}

func (d CalibrationStatus) Dispatch(msg iot.Message) {
	process.Do(iot.NewContext(), process.NewCalibrationStatus(), msg)
}
