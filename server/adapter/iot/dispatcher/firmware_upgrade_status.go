package dispatcher

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/process"
)

type FirmwareUpgradeStatus struct {
}

func NewFirmwareUpgradeStatus() iot.Dispatcher {
	return &FirmwareUpgradeStatus{}
}

func (d FirmwareUpgradeStatus) Name() string {
	return "firmwareUpgradeStatus"
}

func (d FirmwareUpgradeStatus) Dispatch(msg iot.Message) {
	process.Do(iot.NewContext(), process.NewFirmwareUpgradeStatus(), msg)
}
