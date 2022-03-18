package service

import (
	"context"
	"errors"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/device"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/command"
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

func (s Device) CreateDevice(req request.CreateDevice) error {
	cmd, err := s.factory.NewDeviceCreateCmd(req)
	if err != nil {
		return err
	}
	return cmd.Run()
}

func (s Device) DeleteDeviceByID(id uint) error {
	cmd, err := s.factory.NewDeviceRemoveCmd(id)
	if err != nil {
		return err
	}
	return cmd.Run()
}

func (s Device) UpdateDeviceByID(id uint, req request.UpdateDevice) error {
	cmd, err := s.factory.NewDeviceUpdateCmd(id)
	if err != nil {
		return err
	}
	return cmd.UpdateBaseInfo(req)
}

func (s Device) GetDeviceByID(id uint, filters request.Filters) (*vo.Device, error) {
	query := s.factory.NewDeviceQuery(filters)
	return query.Get(id)
}

func (s Device) FindDevicesByPaginate(page, size int, filters request.Filters) ([]vo.Device, int64, error) {
	query := s.factory.NewDeviceQuery(filters)
	return query.Paging(page, size)
}

func (s Device) FindDevices(filters request.Filters) ([]vo.Device, error) {
	query := s.factory.NewDeviceQuery(filters)
	return query.List()
}

func (s Device) UpdateDeviceSettingByID(id uint, req request.DeviceSetting) error {
	cmd, err := s.factory.NewDeviceUpdateCmd(id)
	if err != nil {
		return err
	}
	return cmd.UpdateSettings(req)
}

func (s Device) GetDeviceSettingsByID(id uint) (vo.DeviceSettings, error) {
	query := s.factory.NewDeviceQuery(nil)
	return query.GetSettings(id)
}

func (s Device) CheckDeviceMacAddress(mac string) error {
	_, err := s.repository.GetBySpecs(context.TODO(), spec.DeviceMacEqSpec(mac))
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil
	}
	return response.BusinessErr(errcode.DeviceMacExistsError, mac)
}

func (s Device) FindDeviceDataByID(id uint, sensorType uint, from, to int64) ([]vo.DeviceData, error) {
	query := s.factory.NewDeviceQuery(nil)
	return query.FindDataByID(id, sensorType, time.Unix(from, 0), time.Unix(to, 0))
}

func (s Device) GetDeviceDataByIDAndTimestamp(id uint, sensorType uint, timestamp int64, filters request.Filters) (*vo.DeviceData, error) {
	query := s.factory.NewDeviceQuery(nil)
	return query.GetDataByIDAndTimestamp(id, sensorType, time.Unix(timestamp, 0), filters)
}

func (s Device) GetRuntimeDataByID(id uint, from, to int64) ([]vo.SensorRuntimeData, error) {
	query := s.factory.NewDeviceQuery(nil)
	return query.RuntimeDataByRange(id, time.Unix(from, 0), time.Unix(to, 0))
}

func (s Device) DownloadDeviceDataByID(id uint, pids []string, from, to int64, timezone string) (*vo.ExcelFile, error) {
	query := s.factory.NewDeviceQuery(nil)
	return query.DownloadCharacteristicData(id, pids, time.Unix(from, 0), time.Unix(to, 0), timezone)
}

func (s Device) DownloadDeviceDataByIDAndTimestamp(id uint, sensorType uint, timestamp int64, filters request.Filters) (*vo.ExcelFile, error) {
	query := s.factory.NewDeviceQuery(nil)
	return query.DownloadLargeSensorData(id, sensorType, time.Unix(timestamp, 0), filters)
}

func (s Device) RemoveDataByID(id uint, sensorType uint, from, to int64) error {
	cmd, err := s.factory.NewDeviceRemoveCmd(id)
	if err != nil {
		return err
	}
	return cmd.RemoveData(sensorType, time.Unix(from, 0), time.Unix(to, 0))
}

func (s Device) ExecuteCommandByID(id uint, cmdType uint, req request.DeviceCommand) error {
	cmd, err := s.factory.NewDeviceExecuteCommandCmd(id)
	if err != nil {
		return err
	}
	switch command.Type(cmdType) {
	case command.CalibrateCmdType:
		return cmd.Calibrate(req.Param)
	}
	return cmd.Run(cmdType)
}

func (s Device) ExecuteDeviceUpgradeByID(id uint, req request.DeviceUpgrade) error {
	cmd, err := s.factory.NewDeviceUpgradeCmd(id)
	if err != nil {
		return err
	}
	return cmd.Upgrade(req)
}

func (s Device) ExecuteDeviceCancelUpgradeByID(id uint) error {
	cmd, err := s.factory.NewDeviceUpgradeCmd(id)
	if err != nil {
		return err
	}
	return cmd.CancelUpgrade()
}

func (s Device) FindDeviceEventsByID(id uint, from, to int64) ([]vo.DeviceEvent, error) {
	query := s.factory.NewDeviceQuery(nil)
	return query.FindEventsByID(id, from, to)
}

func (s Device) PagingDeviceEventsByID(id uint, from, to int64, page, size int) ([]vo.DeviceEvent, int64, error) {
	query := s.factory.NewDeviceQuery(nil)
	return query.PagingEventsByID(id, from, to, page, size)
}

func (s Device) RemoveDeviceEventsByID(id uint, eventIDs []uint) error {
	cmd, err := s.factory.NewDeviceRemoveCmd(id)
	if err != nil {
		return err
	}
	return cmd.RemoveEvents(eventIDs)
}
