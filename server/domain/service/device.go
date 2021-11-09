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

func (s Device) RemoveDevice(deviceID uint) error {
	cmd, err := s.factory.NewDeviceRemoveCmd(deviceID)
	if err != nil {
		return err
	}
	return cmd.Run()
}

func (s Device) UpdateDevice(deviceID uint, req request.Device) error {
	cmd, err := s.factory.NewDeviceUpdateCmd(deviceID)
	if err != nil {
		return err
	}
	return cmd.UpdateBaseInfo(req)
}

func (s Device) GetDevice(deviceID uint) (*vo.Device, error) {
	query, err := s.factory.NewDeviceQuery(deviceID)
	if err != nil {
		return nil, err
	}
	return query.Detail()
}

func (s Device) FindDevicesByPaginate(assetID, page, size int, req request.DeviceSearch) ([]vo.Device, int64, error) {
	query, err := s.factory.NewDevicePagingQuery(assetID, page, size, req)
	if err != nil {
		return nil, 0, err
	}
	result, total := query.Paging()
	return result, total, nil
}

func (s Device) FindDevicesGroupByAsset(deviceType uint) ([]vo.Group, error) {
	query, err := s.factory.NewDeviceGroupByQuery(deviceType)
	if err != nil {
		return nil, err
	}
	return query.GroupBy("asset")
}

func (s Device) UpdateDeviceSetting(deviceID uint, req request.DeviceSetting) error {
	cmd, err := s.factory.NewDeviceUpdateCmd(deviceID)
	if err != nil {
		return err
	}
	return cmd.UpdateSetting(req)
}

func (s Device) GetDeviceSetting(deviceID uint) (*vo.DeviceSetting, error) {
	query, err := s.factory.NewDeviceQuery(deviceID)
	if err != nil {
		return nil, err
	}
	return query.Setting(), nil
}

func (s Device) CheckDeviceMacAddress(mac string) error {
	_, err := s.repository.GetBySpecs(context.TODO(), spec.DeviceMacSpec(mac))
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil
	}
	return response.BusinessErr(errcode.DeviceMacExistsError, mac)
}

func (s Device) ReplaceDevice(deviceID uint, mac string) error {
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

func (s Device) FindDeviceDataByID(deviceID uint, from, to int64) ([]vo.PropertyData, error) {
	query, err := s.factory.NewDeviceQuery(deviceID)
	if err != nil {
		return nil, err
	}
	return query.DataByRange(time.Unix(from, 0), time.Unix(to, 0))
}

func (Device) RemoveDataByID(deviceID int, from, to int64) error {
	panic("implement me")
}

func (s Device) ExecuteCommand(deviceID uint, cmdType uint) error {
	cmd, err := s.factory.NewDeviceExecuteCommandCmd(deviceID)
	if err != nil {
		return err
	}
	return cmd.Run(cmdType)
}

func (s Device) ExecuteDeviceUpgrade(deviceID uint, req request.DeviceUpgrade) error {
	cmd, err := s.factory.NewDeviceUpgradeCmd(deviceID)
	if err != nil {
		return err
	}
	return cmd.Upgrade(req)
}

func (s Device) ExecuteDeviceCancelUpgrade(deviceID uint) error {
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

func (s Device) Statistic() ([]vo.DeviceStatistic, error) {
	query, err := s.factory.NewDeviceStatisticQuery()
	if err != nil {
		return nil, err
	}
	return query.Statistic()
}
