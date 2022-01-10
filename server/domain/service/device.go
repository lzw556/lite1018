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
	return query.Detail()
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
	query, err := s.factory.NewDeviceListQueryByFilter(filters)
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
	return cmd.UpdateSetting(req)
}

func (s Device) GetDeviceSettingByID(deviceID uint) (*vo.DeviceSetting, error) {
	query, err := s.factory.NewDeviceQuery(deviceID)
	if err != nil {
		return nil, err
	}
	return query.Setting(), nil
}

func (s Device) CheckDeviceMacAddress(mac string) error {
	_, err := s.repository.GetBySpecs(context.TODO(), spec.DeviceMacEqSpec(mac))
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil
	}
	return response.BusinessErr(errcode.DeviceMacExistsError, mac)
}

func (s Device) ReplaceDeviceByID(deviceID uint, mac string) error {
	cmd, err := s.factory.NewDeviceUpdateCmd(deviceID)
	if err != nil {
		return err
	}
	return cmd.Replace(mac)
}

func (s Device) GetPropertyDataByID(deviceID uint, pID uint, from, to int64) (vo.PropertyData, error) {
	query, err := s.factory.NewDeviceQuery(deviceID)
	if err != nil {
		return vo.PropertyData{}, err
	}
	return query.PropertyDataByRange(pID, time.Unix(from, 0), time.Unix(to, 0))
}

func (s Device) GetPropertyDataByIDs(deviceID uint, pIDs []uint, from, to int64) (vo.PropertiesData, error) {
	query, err := s.factory.NewDeviceQuery(deviceID)
	if err != nil {
		return nil, err
	}
	result := make([]vo.PropertyData, len(pIDs))
	for i, pid := range pIDs {
		result[i], err = query.PropertyDataByRange(pid, time.Unix(from, 0), time.Unix(to, 0))
		if err != nil {
			return nil, err
		}
	}
	return result, nil
}

func (s Device) FindDeviceDataByID(deviceID uint, from, to int64) ([]vo.PropertyData, error) {
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

func (s Device) GetDevicesStatistics(filters request.Filters) ([]vo.DeviceStatistic, error) {
	query, err := s.factory.NewDeviceStatisticsQuery(filters)
	if err != nil {
		return nil, err
	}
	return query.Run()
}
