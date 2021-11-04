package factory

import (
	"context"
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/query"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
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

func (factory Firmware) NewFirmwaresQuery(deviceID uint) (*query.FirmwaresQuery, error) {
	ctx := context.TODO()
	device, err := factory.deviceRepo.Get(ctx, deviceID)
	if err != nil {
		return nil, response.BusinessErr(errcode.DeviceNotFoundError, "")
	}
	info, err := factory.deviceInformationRepo.Get(device.ID)
	if err != nil {
		return nil, err
	}
	if info.ProductID == 0 {
		return nil, fmt.Errorf("unknown device product id")
	}
	es, err := factory.firmwareRepo.FindBySpecs(ctx, spec.ProductIDSpec(info.ProductID))
	if err != nil {
		return nil, err
	}
	q := query.NewFirmwaresQuery()
	q.Firmwares = es
	return &q, nil
}
