package device

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type Service interface {
	CreateDevice(req request.Device) error
	DeleteDeviceByID(id uint) error
	UpdateDeviceByID(id uint, req request.Device) error

	GetDeviceByID(id uint) (*vo.Device, error)
	FindDevicesByPaginate(page, size int, filters request.Filters) ([]vo.Device, int64, error)
	FindDevices(filters request.Filters) ([]vo.Device, error)
	CheckDeviceMacAddress(mac string) error

	ExecuteCommandByID(id uint, cmdType uint) error
	ExecuteDeviceUpgradeByID(id uint, req request.DeviceUpgrade) error
	ExecuteDeviceCancelUpgradeByID(id uint) error

	GetDeviceSettingsByID(id uint) (vo.DeviceSettings, error)
	UpdateDeviceSettingByID(id uint, req request.DeviceSetting) error

	FindDeviceDataByPaginate(id uint, sensorType uint, from, to int64, page, size int) ([]vo.DeviceData, int64, error)
	FindDeviceDataByID(id uint, sensorType uint, from, to int64) ([]vo.DeviceData, error)
	GetDeviceDataByIDAndTimestamp(id uint, sensorType uint, timestamp int64, filters request.Filters) (*vo.DeviceData, error)
	GetLastDeviceDataByID(id uint) (*vo.DeviceData, error)
	GetRuntimeDataByID(id uint, from, to int64) ([]vo.SensorRuntimeData, error)
	//FindWaveDataByID(deviceID uint, from, to int64) (vo.LargeSensorDataList, error)
	//GetWaveDataByID(deviceID uint, timestamp int64, calculate string, dimension int) (*vo.KxData, error)
	DownloadDeviceDataByID(id uint, sensorType uint, pIDs []string, from, to int64) (*vo.ExcelFile, error)
	RemoveDataByID(id uint, sensorType uint, from, to int64) error
}
