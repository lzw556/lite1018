package dispatcher

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/process"
)

type LinkStatus struct {
}

func NewLinkStatus() LinkStatus {
	return LinkStatus{}
}

func (LinkStatus) Name() string {
	return "linkStatus"
}

func (d LinkStatus) Dispatch(msg iot.Message) {
	process.Do(iot.NewContext(), process.NewLinkStatus(), msg)
}
