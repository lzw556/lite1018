package property

import "github.com/thetasensors/theta-cloud-lite/server/domain/vo"

type Service interface {
	FindPropertiesByDeviceType(deviceType uint) (vo.Properties, error)
}
