package dispatcher

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/process"
)

type LinkStatus struct {
	context   *iot.Context
	processor process.Processor
}

func NewLinkStatus() LinkStatus {
	return LinkStatus{
		context:   iot.NewContext(),
		processor: process.NewLinkStatus(),
	}
}

func (LinkStatus) Name() string {
	return "linkStatus"
}

func (d LinkStatus) Dispatch(msg iot.Message) {
	process.Do(d.context, d.processor, msg)
}
