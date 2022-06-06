package dispatcher

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/process"
)

type DeviceInformation struct {
}

func NewDeviceInformation() iot.Dispatcher {
	return DeviceInformation{}
}

func (DeviceInformation) Name() string {
	return "deviceInformation"
}

func (d DeviceInformation) Dispatch(msg iot.Message) {
	process.Do(iot.NewContext(), process.NewDeviceInformation(), msg)
}
