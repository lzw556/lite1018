package dependency

import "github.com/thetasensors/theta-cloud-lite/server/domain/entity"

type DeviceConnectionStateRepository interface {
	Create(mac string, e *entity.DeviceConnectionState) error
	Get(mac string) (*entity.DeviceConnectionState, error)
	Delete(mac string) error
	Update(mac string, e *entity.DeviceConnectionState) error
}
