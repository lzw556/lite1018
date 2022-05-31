package dispatcher

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/process"
)

type Bye struct {
}

func NewBye() iot.Dispatcher {
	return &Bye{}
}

func (Bye) Name() string {
	return "bye"
}

func (d Bye) Dispatch(msg iot.Message) {
	process.Do(iot.NewContext(), process.NewBye(), msg)
}
