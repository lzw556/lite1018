package vo

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
)

type DeviceStatus struct {
	entity.DeviceConnectionState
	po.DeviceStatus
}
