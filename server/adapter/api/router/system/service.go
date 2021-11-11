package system

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type Service interface {
	GetSystem() (*vo.System, error)
	Reboot() error
}
