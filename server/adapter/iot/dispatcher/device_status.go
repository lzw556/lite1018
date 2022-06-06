package dispatcher

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/process"
)

type DeviceStatus struct {
}

func NewDeviceStatus() iot.Dispatcher {
	return &DeviceStatus{}
}

func (DeviceStatus) Name() string {
	return "deviceStatus"
}

func (d DeviceStatus) Dispatch(msg iot.Message) {
	process.Do(iot.NewContext(), process.NewDeviceStatus(), msg)
}
