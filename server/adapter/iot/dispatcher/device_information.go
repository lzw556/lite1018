package dispatcher

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/process"
)

type DeviceInformation struct {
	context   *iot.Context
	processor process.Processor
}

func NewDeviceInformation() iot.Dispatcher {
	return DeviceInformation{
		context:   iot.NewContext(),
		processor: process.NewDeviceInformation(),
	}
}

func (DeviceInformation) Name() string {
	return "deviceInformation"
}

func (d DeviceInformation) Dispatch(msg iot.Message) {
	process.Do(d.context, d.processor, msg)
}
