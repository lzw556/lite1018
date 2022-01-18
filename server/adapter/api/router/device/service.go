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
	FilterDevices(filters request.Filters) ([]vo.Device, error)
	CheckDeviceMacAddress(mac string) error
	ReplaceDeviceByID(id uint, mac string) error

	ExecuteCommandByID(id uint, cmdType uint) error
	ExecuteDeviceUpgradeByID(id uint, req request.DeviceUpgrade) error
	ExecuteDeviceCancelUpgradeByID(id uint) error

	GetDeviceSettingsByID(id uint) (vo.DeviceSettings, error)
	UpdateDeviceSettingByID(id uint, req request.DeviceSetting) error

	GetPropertyDataByID(deviceID uint, pID uint, from, to int64) (vo.PropertyData, error)
	GetPropertyDataByIDs(deviceID uint, pIDs []uint, from, to int64) (vo.PropertiesData, error)
	FindDeviceDataByID(deviceID uint, from, to int64) ([]vo.PropertyData, error)
	RemoveDataByID(deviceID uint, from, to int64) error
	GetChildren(deviceID uint) ([]vo.Device, error)
}
