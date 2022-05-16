package query

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
)

type FirmwareQuery struct {
	Specs []spec.Specification

	firmwareRepo          dependency.FirmwareRepository
	deviceRepo            dependency.DeviceRepository
	deviceInformationRepo dependency.DeviceInformationRepository
}

func NewFirmwareQuery() FirmwareQuery {
	return FirmwareQuery{
		firmwareRepo:          repository.Firmware{},
		deviceRepo:            repository.Device{},
		deviceInformationRepo: repository.DeviceInformation{},
	}
}

func (query FirmwareQuery) FindByDeviceID(id uint) (vo.Firmwares, error) {
	ctx := context.TODO()
	device, err := query.deviceRepo.Get(ctx, id)
	if err != nil {
		return nil, response.BusinessErr(errcode.DeviceNotFoundError, "")
	}
	info, err := query.deviceInformationRepo.Get(device.MacAddress)
	if err != nil {
		return nil, err
	}
	if info.ProductID == 0 {
		return nil, response.BusinessErr(errcode.FirmwareNotFoundError, "")
	}
	es, err := query.firmwareRepo.FindBySpecs(ctx, spec.ProductIDEqSpec(info.ProductID))
	if err != nil {
		return nil, err
	}

	result := make(vo.Firmwares, len(es))
	for i, e := range es {
		result[i] = vo.NewFirmware(e)
	}

	return result, nil
}

func (query FirmwareQuery) Paging(page, size int) (vo.Firmwares, int64, error) {
	ctx := context.TODO()
	es, total, err := query.firmwareRepo.Paging(ctx, page, size)
	if err != nil {
		return nil, 0, err
	}
	result := make(vo.Firmwares, len(es))
	for i, e := range es {
		result[i] = vo.NewFirmware(e)
	}
	return result, total, nil
}
