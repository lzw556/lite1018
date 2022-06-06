package dispatcher

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/process"
)

type RestartStatus struct{}

func NewRestartStatus() RestartStatus {
	return RestartStatus{}
}

func (RestartStatus) Name() string {
	return "restartStatus"
}

func (d RestartStatus) Dispatch(msg iot.Message) {
	process.Do(iot.NewContext(), process.NewRestartStatus(), msg)
}
