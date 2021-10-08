package dispatcher

import (
	"github.com/gogo/protobuf/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
)

type DeviceSettings struct {
	deviceRepo dependency.DeviceRepository
}

func NewDeviceSettings() iot.Dispatcher {
	return &DeviceSettings{
		deviceRepo: repository.Device{},
	}
}

func (DeviceSettings) Name() string {
	return "deviceSettings"
}

func (DeviceSettings) Dispatch(msg iot.Message) {
	m := pd.DeviceSettingsMessage{}
	if err := proto.Unmarshal(msg.Body.Payload, &m); err != nil {
		xlog.Error("unmarshal [DeviceSettings] message failed", err)
		return
	}
}
