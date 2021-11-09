package vo

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
)

type DeviceState struct {
	entity.DeviceConnectionState
	po.DeviceStatus
}
