package po

import "gorm.io/gorm"

type MeasurementProcess struct {
	gorm.Model
	MeasurementID uint
	DeviceBinding MeasurementDeviceBinding `gorm:"type:json"`
	Parameters    Parameters               `gorm:"type:json"`
}

func (MeasurementProcess) TableName() string {
	return "ts_measurement_process"
}
