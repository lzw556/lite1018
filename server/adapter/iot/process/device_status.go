package process

import (
	"fmt"
	"github.com/gogo/protobuf/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
	"time"
)

type DeviceStatus struct {
	repository dependency.DeviceStateRepository
}

func NewDeviceStatus() Processor {
	return newRoot(DeviceStatus{
		repository: repository.DeviceState{},
	})
}

func (p DeviceStatus) Name() string {
	return "DeviceState"
}

func (DeviceStatus) Next() Processor {
	return nil
}

func (p DeviceStatus) Process(ctx *iot.Context, msg iot.Message) error {
	if value, ok := ctx.Get(msg.Body.Device); ok {
		if device, ok := value.(entity.Device); ok {
			m := pd.DeviceStatusMessage{}
			if err := proto.Unmarshal(msg.Body.Payload, &m); err != nil {
				return fmt.Errorf("unmarshal [DeviceState] message failed： %v", err)
			}
			var e entity.DeviceState
			if err := json.Unmarshal([]byte(m.Status), &e); err != nil {
				return fmt.Errorf("unmarshal device %s status %s failed: %v", device.MacAddress, m.Status, err)
			}
			e.IsOnline = true
			e.ConnectedAt = time.Now().UTC().Unix()
			if err := p.repository.Create(device.MacAddress, e); err != nil {
				return fmt.Errorf("save device status failed: %v", err)
			}
		}
	}
	return nil
}
