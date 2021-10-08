package dispatcher

import (
	"github.com/gogo/protobuf/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
)

type DeviceInformation struct {
	deviceRepo dependency.DeviceRepository
}

func NewDeviceInformation() iot.Dispatcher {
	return DeviceInformation{
		deviceRepo: repository.Device{},
	}
}

func (DeviceInformation) Name() string {
	return "deviceInformation"
}

func (DeviceInformation) Dispatch(msg iot.Message) {
	m := pd.DeviceInformationMessage{}
	if err := proto.Unmarshal(msg.Body.Payload, &m); err != nil {
		xlog.Error("unmarshal [DeviceInformation] message failed", err)
		return
	}
}
