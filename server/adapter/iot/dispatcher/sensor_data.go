package dispatcher

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/process"
)

type SensorData struct {
}

func NewSensorData() iot.Dispatcher {
	return SensorData{}
}

func (SensorData) Name() string {
	return "sensorData"
}

func (d SensorData) Dispatch(msg iot.Message) {
	process.Do(iot.NewContext(), process.NewSensorData(), msg)
}
