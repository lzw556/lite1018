package dispatcher

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/process"
)

type Bye struct {
	context   *iot.Context
	processor process.Processor
}

func NewBye() iot.Dispatcher {
	return &Bye{
		context:   iot.NewContext(),
		processor: process.NewBye(),
	}
}

func (Bye) Name() string {
	return "bye"
}

func (d Bye) Dispatch(msg iot.Message) {
	process.Do(d.context, d.processor, msg)
}
