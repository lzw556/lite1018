package dispatcher

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/process"
)

type LinkStates struct {
}

func NewLinkStates() LinkStates {
	return LinkStates{}
}

func (d LinkStates) Name() string {
	return "linkStates"
}

func (d LinkStates) Dispatch(msg iot.Message) {
	process.Do(iot.NewContext(), process.NewLinkStates(), msg)
}
