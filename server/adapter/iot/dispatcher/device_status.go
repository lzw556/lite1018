package dispatcher

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/process"
)

type DeviceStatus struct {
	context   *iot.Context
	processor process.Processor
}

func NewDeviceStatus() iot.Dispatcher {
	return &DeviceStatus{
		context:   iot.NewContext(),
		processor: process.NewDeviceStatus(),
	}
}

func (DeviceStatus) Name() string {
	return "deviceStatus"
}

func (d DeviceStatus) Dispatch(msg iot.Message) {
	process.Do(d.context, d.processor, msg)
}
