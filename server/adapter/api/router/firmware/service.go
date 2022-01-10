package firmware

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type Service interface {
	CreateFirmware(req request.Firmware) error

	FindFirmwaresByPaginate(page, size int) (vo.Firmwares, int64, error)
	FindFirmwaresByDeviceID(deviceID uint) (vo.Firmwares, error)

	DeleteFirmwareByID(id uint) error
}
