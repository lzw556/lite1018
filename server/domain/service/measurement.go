package service

import (
	"context"
	"errors"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/measurement"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/factory"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"gorm.io/gorm"
)

type Measurement struct {
	repository dependency.MeasurementRepository
	binding    dependency.MeasurementDeviceBindingRepository
	factory    factory.Measurement
}

func NewMeasurement() measurement.Service {
	return Measurement{
		repository: repository.Measurement{},
		binding:    repository.MeasurementDeviceBinding{},
		factory:    factory.NewMeasurement(),
	}
}

func (s Measurement) CreateMeasurement(req request.CreateMeasurement) (uint, error) {
	cmd, err := s.factory.NewMeasurementCreateCmd(req)
	if err != nil {
		return 0, err
	}
	return cmd.Run()
}

func (s Measurement) CheckDeviceBinding(macAddress string) error {
	_, err := s.binding.GetBySpecs(context.TODO(), spec.DeviceMacEqSpec(macAddress))
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil
	}
	return response.BusinessErr(errcode.DeviceAlreadyBindingError, "")
}

func (s Measurement) FilterMeasurements(req request.Filters) ([]vo.Measurement, error) {
	query, err := s.factory.NewMeasurementFilterQuery(req)
	if err != nil {
		return nil, err
	}
	return query.Run(), nil
}

func (s Measurement) GetMeasurement(id uint) (*vo.Measurement, error) {
	query, err := s.factory.NewMeasurementQuery(id)
	if err != nil {
		return nil, err
	}
	return query.GetDetail(), nil
}

func (s Measurement) GetMeasurementSettingsByID(id uint) (*vo.MeasurementSettings, error) {
	query, err := s.factory.NewMeasurementQuery(id)
	if err != nil {
		return nil, err
	}
	return query.GetSettings()
}

func (s Measurement) UpdateMeasurementSettingsByID(id uint, req request.MeasurementSettings) error {
	cmd, err := s.factory.NewMeasurementUpdateCmd(id)
	if err != nil {
		return err
	}
	return cmd.UpdateSettings(req)
}

func (s Measurement) UpdateMeasurementDeviceBindingsByID(id uint, req request.UpdateMeasurementDeviceBindings) error {
	cmd, err := s.factory.NewMeasurementUpdateCmd(id)
	if err != nil {
		return err
	}
	return cmd.UpdateDeviceBindings(req)
}

func (s Measurement) GetMeasurementData(id uint, from, to int64) ([]vo.MeasurementData, error) {
	query, err := s.factory.NewMeasurementQuery(id)
	if err != nil {
		return nil, err
	}
	return query.GetData(from, to)
}

func (s Measurement) GetMeasurementRawData(id uint, from, to int64) (vo.MeasurementsRawData, error) {
	query, err := s.factory.NewMeasurementQuery(id)
	if err != nil {
		return nil, err
	}
	return query.GateRawDataByRange(from, to)
}

func (s Measurement) GetMeasurementWaveDataByTimestamp(id uint, timestamp int64, calc string) (*vo.WaveData, error) {
	query, err := s.factory.NewMeasurementQuery(id)
	if err != nil {
		return nil, err
	}
	return query.GetWaveData(timestamp, calc)
}

func (s Measurement) UpdateMeasurementByID(id uint, req request.CreateMeasurement) error {
	cmd, err := s.factory.NewMeasurementUpdateCmd(id)
	if err != nil {
		return err
	}
	return cmd.Update(req)
}

func (s Measurement) DeleteMeasurementByID(id uint) error {
	cmd, err := s.factory.NewMeasurementRemoveCmd(id)
	if err != nil {
		return err
	}
	return cmd.Remove()
}

func (s Measurement) RemoveMeasurementDataByID(id uint, from, to int64) error {
	cmd, err := s.factory.NewMeasurementRemoveCmd(id)
	if err != nil {
		return err
	}
	return cmd.RemoveData(from, to)
}
