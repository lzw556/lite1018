package dispatcher

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/process"
)

type Event struct {
	context   *iot.Context
	processor process.Processor
}

func NewEvent() iot.Dispatcher {
	return &Event{
		context:   iot.NewContext(),
		processor: process.NewEvent(),
	}
}

func (d Event) Name() string {
	return "event"
}

func (d Event) Dispatch(msg iot.Message) {
	process.Do(d.context, d.processor, msg)
}
