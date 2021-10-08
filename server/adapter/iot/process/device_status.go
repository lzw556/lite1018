package process

import (
	"fmt"
	"github.com/gogo/protobuf/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
)

type DeviceStatus struct {
	deviceStatusRepo dependency.DeviceStatusRepository
}

func NewDeviceStatus() Processor {
	return newRoot(DeviceStatus{
		deviceStatusRepo: repository.DeviceStatus{},
	})
}

func (p DeviceStatus) Name() string {
	return "DeviceStatus"
}

func (DeviceStatus) Next() Processor {
	return nil
}

func (p DeviceStatus) Process(ctx *iot.Context, msg iot.Message) error {
	if value, ok := ctx.Get(msg.Body.Device); ok {
		if device, ok := value.(po.Device); ok {
			m := pd.DeviceStatusMessage{}
			if err := proto.Unmarshal(msg.Body.Payload, &m); err != nil {
				return fmt.Errorf("unmarshal [DeviceStatus] message failed： %v", err)
			}
			var e po.DeviceStatus
			if err := json.Unmarshal([]byte(m.Status), &e); err != nil {
				return fmt.Errorf("unmarshal device %s status %s failed: %v", device.MacAddress, m.Status, err)
			}
			if err := p.deviceStatusRepo.Create(device.ID, e); err != nil {
				return fmt.Errorf("save device status failed: %v", err)
			}
		}
	}
	return nil
}
