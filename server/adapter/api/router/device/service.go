package device

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type Service interface {
	CreateDevice(req request.Device) error
	DeleteDeviceByID(id uint) error
	UpdateDeviceByID(id uint, req request.Device) error

	GetDeviceByID(id uint, filters request.Filters) (*vo.Device, error)
	FindDevicesByPaginate(page, size int, filters request.Filters) ([]vo.Device, int64, error)
	FindDevices(filters request.Filters) ([]vo.Device, error)
	CheckDeviceMacAddress(mac string) error

	ExecuteCommandByID(id uint, cmdType uint) error
	ExecuteDeviceUpgradeByID(id uint, req request.DeviceUpgrade) error
	ExecuteDeviceCancelUpgradeByID(id uint) error

	GetDeviceSettingsByID(id uint) (vo.DeviceSettings, error)
	UpdateDeviceSettingByID(id uint, req request.DeviceSetting) error

	FindDeviceDataByID(id uint, sensorType uint, from, to int64) ([]vo.DeviceData, error)
	GetDeviceDataByIDAndTimestamp(id uint, sensorType uint, timestamp int64, filters request.Filters) (*vo.DeviceData, error)
	GetRuntimeDataByID(id uint, from, to int64) ([]vo.SensorRuntimeData, error)
	DownloadDeviceDataByID(id uint, pids []string, from, to int64, timezone string) (*vo.ExcelFile, error)
	DownloadDeviceDataByIDAndTimestamp(id uint, sensorType uint, timestamp int64, filters request.Filters) (*vo.ExcelFile, error)
	RemoveDataByID(id uint, sensorType uint, from, to int64) error
}
