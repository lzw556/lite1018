package device

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type Service interface {
	CreateDevice(req request.Device) error
	RemoveDevice(deviceID uint) error
	UpdateDevice(deviceID uint, req request.Device) error

	GetDevice(deviceID uint) (*vo.Device, error)
	FindDevicesByPaginate(assetID, page, size int, req request.DeviceSearch) ([]vo.Device, int64, error)
	FindDevicesGroupByAsset(deviceType uint) ([]vo.Group, error)
	CheckDeviceMacAddress(mac string) error
	ReplaceDevice(deviceID uint, mac string) error

	ExecuteCommand(deviceID uint, cmdType uint) error

	GetDeviceSetting(deviceID uint) (*vo.DeviceSetting, error)
	UpdateDeviceSetting(deviceID uint, req request.DeviceSetting) error

	FindDataByID(deviceID uint, pID uint, from, to int64) (vo.PropertyData, error)
	RemoveDataByID(deviceID int, from, to int64) error
}
