package process

import (
	"fmt"
	"github.com/gogo/protobuf/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/eventbus"
)

type FirmwareUpgradeStatus struct {
}

func NewFirmwareUpgradeStatus() Processor {
	return newRoot(&FirmwareUpgradeStatus{})
}

func (p FirmwareUpgradeStatus) Name() string {
	return "FirmwareUpgradeStatus"
}

func (p FirmwareUpgradeStatus) Next() Processor {
	return nil
}

func (p FirmwareUpgradeStatus) Process(ctx *iot.Context, msg iot.Message) error {
	if value, ok := ctx.Get(msg.Body.Device); ok {
		if device, ok := value.(entity.Device); ok {
			m := pd.FirmwareUpgradeStatusMessage{}
			if err := proto.Unmarshal(msg.Body.Payload, &m); err != nil {
				return fmt.Errorf("unmarshal [FirmwareUpgradeStatus] message failed: %v", err)
			}
			if m.Code != 0 {
				device.UpdateDeviceUpgradeStatus(entity.DeviceUpgradeError, m.Progress)
				return fmt.Errorf("loading firmware failed: error_code = %d", m.Code)
			} else {
				device.UpdateDeviceUpgradeStatus(entity.DeviceUpgradeUpgrading, m.Progress)
				eventbus.Publish(eventbus.DeviceUpgradeStatus, m)
			}
		}
	}
	return nil
}
