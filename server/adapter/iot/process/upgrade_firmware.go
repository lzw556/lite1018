package process

import (
	"fmt"
	"github.com/gogo/protobuf/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/eventbus"
)

type UpgradeFirmware struct {
}

func NewUpgradeFirmware() Processor {
	return newRoot(&UpgradeFirmware{})
}

func (p UpgradeFirmware) Name() string {
	return "UpgradeFirmware"
}

func (p UpgradeFirmware) Next() Processor {
	return nil
}

func (p UpgradeFirmware) Process(ctx *iot.Context, msg iot.Message) error {
	if value, ok := ctx.Get(msg.Body.Device); ok {
		if device, ok := value.(entity.Device); ok {
			m := pd.FirmwareUpgradeResponseMessage{}
			if err := proto.Unmarshal(msg.Body.Payload, &m); err != nil {
				return fmt.Errorf("unmarshal [FirmwareUpgradeResponse] message failed: %v", err)
			}
			fmt.Println(device)
			eventbus.Publish(eventbus.DeviceUpgradeResponse, m)
		}
	}
	return nil
}
