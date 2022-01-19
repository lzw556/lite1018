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
	query, err := s.factory.NewDeviceQuery(deviceID)
	if err != nil {
		return nil, err
	}
	return query.GetDetail()
}

func (s Device) FindDevicesByPaginate(page, size int, filters request.Filters) ([]vo.Device, int64, error) {
	query, err := s.factory.NewDevicePagingQuery(page, size, filters)
	if err != nil {
		return nil, 0, err
	}
	result, total := query.Paging()
	return result, total, nil
}

func (s Device) FilterDevices(filters request.Filters) ([]vo.Device, error) {
	query, err := s.factory.NewDeviceFilterQuery(filters)
	if err != nil {
		return nil, err
	}
	return query.Run(), nil
}

func (s Device) UpdateDeviceSettingByID(deviceID uint, req request.DeviceSetting) error {
	cmd, err := s.factory.NewDeviceUpdateCmd(deviceID)
	if err != nil {
		return err
	}
	return cmd.UpdateSettings(req)
}

func (s Device) GetDeviceSettingsByID(deviceID uint) (vo.DeviceSettings, error) {
	query, err := s.factory.NewDeviceQuery(deviceID)
	if err != nil {
		return nil, err
	}
	return query.GetSettings()
}

func (s Device) CheckDeviceMacAddress(mac string) error {
	_, err := s.repository.GetBySpecs(context.TODO(), spec.DeviceMacEqSpec(mac))
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil
	}
	return response.BusinessErr(errcode.DeviceMacExistsError, mac)
}

func (s Device) ReplaceDeviceByID(deviceID uint, mac string) error {
	return nil
}

func (s Device) GetPropertyDataByID(deviceID uint, pID string, from, to int64) ([]vo.PropertyData, error) {
	query, err := s.factory.NewDeviceQuery(deviceID)
	if err != nil {
		return nil, err
	}
	return query.PropertyDataByRange(pID, time.Unix(from, 0), time.Unix(to, 0))
}

func (s Device) DownloadPropertiesDataByID(deviceID uint, pIDs []string, from, to int64) (*vo.ExcelFile, error) {
	query, err := s.factory.NewDeviceQuery(deviceID)
	if err != nil {
		return nil, err
	}
	return query.DownloadPropertiesDataByRange(pIDs, time.Unix(from, 0), time.Unix(to, 0))
}

func (s Device) FindDeviceDataByID(deviceID uint, from, to int64) (vo.PropertiesData, error) {
	query, err := s.factory.NewDeviceQuery(deviceID)
	if err != nil {
		return nil, err
	}
	return query.DataByRange(time.Unix(from, 0), time.Unix(to, 0))
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

func (s Device) GetChildren(deviceID uint) ([]vo.Device, error) {
	query, err := s.factory.NewDeviceChildrenQuery(deviceID)
	if err != nil {
		return nil, err
	}
	return query.Query()
}
