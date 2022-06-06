package dispatcher

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/process"
)

type LargeSensorData struct {
}

func NewLargeSensorData() iot.Dispatcher {
	return &LargeSensorData{}
}

func (d LargeSensorData) Name() string {
	return "largeSensorData"
}

func (d LargeSensorData) Dispatch(msg iot.Message) {
	process.Do(iot.NewContext(), process.NewLargeSensorData(), msg)
}
