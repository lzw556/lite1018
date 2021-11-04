package dispatcher

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/process"
)

type FirmwareUpgradeStatus struct {
	context   *iot.Context
	processor process.Processor
}

func NewFirmwareUpgradeStatus() iot.Dispatcher {
	return &FirmwareUpgradeStatus{
		context:   iot.NewContext(),
		processor: process.NewFirmwareUpgradeStatus(),
	}
}

func (d FirmwareUpgradeStatus) Name() string {
	return "firmwareUpgradeStatus"
}

func (d FirmwareUpgradeStatus) Dispatch(msg iot.Message) {
	process.Do(d.context, d.processor, msg)
}
