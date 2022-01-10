package measurement

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type Service interface {
	CreateMeasurement(req request.CreateMeasurement) (uint, error)

	CheckDeviceBinding(macAddress string) error

	FindMeasurementsByAssetID(assetID uint) ([]vo.Measurement, error)

	FilterMeasurements(req request.Filters) ([]vo.Measurement, error)

	StatisticalMeasurementsByAssetID(assetID uint) ([]vo.MeasurementStatistic, error)
	StatisticalMeasurementByID(id uint) (*vo.MeasurementStatistic, error)

	GetMeasurement(id uint) (*vo.Measurement, error)
	GetMeasurementData(id uint, from, to int64) ([]vo.MeasurementData, error)
	GetMeasurementRawData(id uint, from, to int64) (vo.MeasurementsRawData, error)
	GetMeasurementWaveDataByTimestamp(id uint, timestamp int64, calc string) (*vo.WaveData, error)
	UpdateMeasurementSettingsByID(id uint, req request.MeasurementSettings) error
	UpdateMeasurementByID(id uint, req request.CreateMeasurement) error
	UpdateMeasurementDeviceBindingsByID(id uint, req request.UpdateMeasurementDeviceBindings) error
	DeleteMeasurementByID(id uint) error
	RemoveMeasurementDataByID(id uint, from, to int64) error
}
