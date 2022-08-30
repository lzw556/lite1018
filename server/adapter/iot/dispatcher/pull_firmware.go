package dispatcher

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/process"
)

type PullFirmware struct{}

func NewPullFirmware() PullFirmware {
	return PullFirmware{}
}

func (d PullFirmware) Name() string {
	return "pullFirmware"
}

func (d PullFirmware) Dispatch(msg iot.Message) {
	process.Do(iot.NewContext(), process.NewPullFirmware(), msg)
}
