package dispatcher

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/process"
)

type Hello struct {
}

func NewHello() iot.Dispatcher {
	return Hello{}
}

func (d Hello) Name() string {
	return "hello"
}

func (d Hello) Dispatch(msg iot.Message) {
	process.Do(iot.NewContext(), process.NewHello(), msg)
}
