package dispatcher

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/process"
)

type Event struct {
}

func NewEvent() iot.Dispatcher {
	return &Event{}
}

func (d Event) Name() string {
	return "event"
}

func (d Event) Dispatch(msg iot.Message) {
	process.Do(iot.NewContext(), process.NewEvent(), msg)
}
