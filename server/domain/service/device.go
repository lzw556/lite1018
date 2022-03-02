package service

import (
	"context"
	"errors"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/device"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/factory"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"gorm.io/gorm"
	"time"
)

type Device struct {
	repository dependency.DeviceRepository
	factory    factory.Device
}

func NewDevice() device.Service {
	return Device{
		repository: repository.Device{},
		factory:    factory.NewDevice(),
	}
}

func (s Device) CreateDevice(req request.Device) error {
	cmd, err := s.factory.NewDeviceCreateCmd(req)
	if err != nil {
		return err
	}
	return cmd.Run()
}

func (s Device) DeleteDeviceByID(deviceID uint) error {
	cmd, err := s.factory.NewDeviceRemoveCmd(deviceID)
	if err != nil {
		return err
	}
	return cmd.Run()
}

func (s Device) UpdateDeviceByID(deviceID uint, req request.Device) error {
	cmd, err := s.factory.NewDeviceUpdateCmd(deviceID)
	if err != nil {
		return err
	}
	return cmd.UpdateBaseInfo(req)
}

func (s Device) GetDeviceByID(deviceID uint) (*vo.Device, error) {
	query := s.factory.NewDeviceQuery()
	return query.Get(deviceID)
}

func (s Device) FindDevicesByPaginate(page, size int, filters request.Filters) ([]vo.Device, int64, error) {
	query := s.factory.NewDeviceQuery(filters...)
	return query.Paging(page, size)
}

func (s Device) FindDevices(filters request.Filters) ([]vo.Device, error) {
	query := s.factory.NewDeviceQuery(filters...)
	return query.List()
}

func (s Device) UpdateDeviceSettingByID(deviceID uint, req request.DeviceSetting) error {
	cmd, err := s.factory.NewDeviceUpdateCmd(deviceID)
	if err != nil {
		return err
	}
	return cmd.UpdateSettings(req)
}

func (s Device) GetDeviceSettingsByID(deviceID uint) (vo.DeviceSettings, error) {
	query := s.factory.NewDeviceQuery()
	return query.GetSettings(deviceID)
}

func (s Device) CheckDeviceMacAddress(mac string) error {
	_, err := s.repository.GetBySpecs(context.TODO(), spec.DeviceMacEqSpec(mac))
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil
	}
	return response.BusinessErr(errcode.DeviceMacExistsError, mac)
}

func (s Device) FindDeviceDataByID(deviceID uint, from, to int64) ([]vo.DeviceData, error) {
	query := s.factory.NewDeviceQuery()
	return query.FindDataByRange(deviceID, time.Unix(from, 0), time.Unix(to, 0))
}

func (s Device) GetLastDeviceDataByID(deviceID uint) (*vo.DeviceData, error) {
	query := s.factory.NewDeviceQuery()
	return query.GetLastData(deviceID)
}

func (s Device) GetRuntimeDataByID(deviceID uint, from, to int64) ([]vo.SensorRuntimeData, error) {
	query := s.factory.NewDeviceQuery()
	return query.RuntimeDataByRange(deviceID, time.Unix(from, 0), time.Unix(to, 0))
}

func (s Device) DownloadDeviceDataByID(deviceID uint, pIDs []string, from, to int64) (*vo.ExcelFile, error) {
	query := s.factory.NewDeviceQuery()
	return query.DownloadDeviceDataByRange(deviceID, pIDs, time.Unix(from, 0), time.Unix(to, 0))
}

func (s Device) FindWaveDataByID(deviceID uint, from, to int64) (vo.LargeSensorDataList, error) {
	query := s.factory.NewDeviceQuery()
	return query.FindWaveDataByRange(deviceID, time.Unix(from, 0), time.Unix(to, 0))
}

func (s Device) GetWaveDataByID(deviceID uint, timestamp int64, calculate string, dimension int) (*vo.WaveData, error) {
	query := s.factory.NewDeviceQuery()
	return query.GetWaveDataByTimestamp(deviceID, timestamp, calculate, dimension)
}

func (s Device) RemoveDataByID(deviceID uint, from, to int64) error {
	cmd, err := s.factory.NewDeviceRemoveCmd(deviceID)
	if err != nil {
		return err
	}
	return cmd.RemoveData(time.Unix(from, 0), time.Unix(to, 0))
}

func (s Device) ExecuteCommandByID(deviceID uint, cmdType uint) error {
	cmd, err := s.factory.NewDeviceExecuteCommandCmd(deviceID)
	if err != nil {
		return err
	}
	return cmd.Run(cmdType)
}

func (s Device) ExecuteDeviceUpgradeByID(deviceID uint, req request.DeviceUpgrade) error {
	cmd, err := s.factory.NewDeviceUpgradeCmd(deviceID)
	if err != nil {
		return err
	}
	return cmd.Upgrade(req)
}

func (s Device) ExecuteDeviceCancelUpgradeByID(deviceID uint) error {
	cmd, err := s.factory.NewDeviceUpgradeCmd(deviceID)
	if err != nil {
		return err
	}
	return cmd.CancelUpgrade()
}
