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
)

type DeviceInformation struct {
	repository dependency.DeviceInformationRepository
}

func NewDeviceInformation() Processor {
	return newRoot(DeviceInformation{
		repository: repository.DeviceInformation{},
	})
}

func (p DeviceInformation) Name() string {
	return "DeviceInformation"
}

func (p DeviceInformation) Next() Processor {
	return nil
}

func (p DeviceInformation) Process(ctx *iot.Context, msg iot.Message) error {
	if value, ok := ctx.Get(msg.Body.Device); ok {
		if device, ok := value.(entity.Device); ok {
			m := pd.DeviceInformationMessage{}
			if err := proto.Unmarshal(msg.Body.Payload, &m); err != nil {
				return fmt.Errorf("unmarshal [DeviceInformation] message failed: %v", err)
			}
			var e entity.DeviceInformation
			if err := json.Unmarshal([]byte(m.Information), &e); err != nil {
				return fmt.Errorf("unmarshal device %s information %s failed: %v", device.MacAddress, m.Information, err)
			}
			e.Timestamp = int64(m.Timestamp)
			if err := p.repository.Create(device.MacAddress, e); err != nil {
				return fmt.Errorf("save device information failed: %v", err)
			}
		}
	}
	return nil
}
