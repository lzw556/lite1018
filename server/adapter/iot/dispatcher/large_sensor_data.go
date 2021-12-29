package dispatcher

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/process"
)

type LargeSensorData struct {
	context   *iot.Context
	processor process.Processor
}

func NewLargeSensorData() iot.Dispatcher {
	return &LargeSensorData{
		context:   iot.NewContext(),
		processor: process.NewLargeSensorData(),
	}
}

func (d LargeSensorData) Name() string {
	return "largeSensorData"
}

func (d LargeSensorData) Dispatch(msg iot.Message) {
	process.Do(d.context, d.processor, msg)
}
