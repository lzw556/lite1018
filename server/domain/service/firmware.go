package service

import (
	"context"
	"errors"
	uuid "github.com/satori/go.uuid"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/firmware"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/factory"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/global"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
	"gorm.io/gorm"
)

type Firmware struct {
	repository dependency.FirmwareRepository
	factory    factory.Firmware
}

func NewFirmware() firmware.Service {
	return Firmware{
		repository: repository.Firmware{},
		factory:    factory.NewFirmware(),
	}
}

func (s Firmware) CreateFirmware(req request.Firmware) error {
	ctx := context.TODO()
	e, err := s.repository.GetBySpecs(ctx, spec.FirmwareCrc(req.Crc))
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return response.BusinessErr(errcode.FirmwareExistsError, req.Crc)
	}
	e = po.Firmware{
		Name:      req.Name,
		Filename:  uuid.NewV1().String(),
		ProductID: uint(req.ProductID),
		Major:     uint(req.Major),
		Minor:     uint(req.Minor),
		Version:   uint(req.Version),
		Size:      uint(req.Size),
		Crc:       req.Crc,
		BuildTime: uint(req.BuildTime),
	}
	return transaction.Execute(ctx, func(txCtx context.Context) error {
		if err := s.repository.Create(txCtx, &e); err != nil {
			return err
		}
		return global.SaveFile(e.Filename, "./resources/firmwares", req.Payload)
	})
}

func (s Firmware) FindFirmwaresByPaginate(page, size int) (vo.Firmwares, int64, error) {
	es, total, err := s.repository.FindByPaginate(context.TODO(), page, size)
	if err != nil {
		return nil, 0, err
	}
	result := make(vo.Firmwares, len(es))
	for i, e := range es {
		result[i] = vo.NewFirmware(e)
	}
	return result, total, nil
}

func (s Firmware) RemoveFirmware(firmwareID uint) error {
	ctx := context.TODO()
	e, err := s.repository.Get(ctx, firmwareID)
	if err != nil {
		return response.BusinessErr(errcode.FirmwareNotFoundError, "")
	}
	return transaction.Execute(ctx, func(txCtx context.Context) error {
		if err := s.repository.Delete(txCtx, e.ID); err != nil {
			return err
		}
		return global.DeleteFile("./resources/firmwares", e.Filename)
	})
}

func (s Firmware) FindFirmwaresByDeviceID(deviceID uint) (vo.Firmwares, error) {
	query, err := s.factory.NewFirmwaresQuery(deviceID)
	if err != nil {
		return nil, err
	}
	return query.Query(), nil
}
