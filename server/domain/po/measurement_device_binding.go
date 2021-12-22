package po

type MeasurementDeviceBinding struct {
	ID            uint `gorm:"primaryKey;autoIncrement"`
	MeasurementID uint
	MacAddress    string `gorm:"type:varchar(12);unique_index"`
	Index         uint
}

func (MeasurementDeviceBinding) TableName() string {
	return "ts_measurement_device_binding"
}
