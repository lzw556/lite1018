package dispatcher

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/process"
)

type SensorData struct {
	context   *iot.Context
	processor process.Processor
}

func NewSensorData() iot.Dispatcher {
	return SensorData{
		context:   iot.NewContext(),
		processor: process.NewSensorData(),
	}
}

func (SensorData) Name() string {
	return "sensorData"
}

func (d SensorData) Dispatch(msg iot.Message) {
	process.Do(d.context, d.processor, msg)
}
