package factory

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/query"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
)

type Firmware struct {
	deviceInformationRepo dependency.DeviceInformationRepository
	deviceRepo            dependency.DeviceRepository
	firmwareRepo          dependency.FirmwareRepository
}

func NewFirmware() Firmware {
	return Firmware{
		deviceRepo:            repository.Device{},
		deviceInformationRepo: repository.DeviceInformation{},
		firmwareRepo:          repository.Firmware{},
	}
}

func (factory Firmware) NewFirmwareQuery(filters ...request.Filter) *query.FirmwareQuery {
	q := query.NewFirmwareQuery()
	return &q
}
