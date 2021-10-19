package property

import "github.com/thetasensors/theta-cloud-lite/server/domain/vo"

type Service interface {
	FindProperties(deviceType uint) ([]vo.Property, error)
}
