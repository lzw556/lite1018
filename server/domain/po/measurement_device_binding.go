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

type MeasurementDeviceBindings []MeasurementDeviceBinding

func (ms MeasurementDeviceBindings) Len() int {
	return len(ms)
}

func (ms MeasurementDeviceBindings) Less(i, j int) bool {
	return ms[i].Index < ms[j].Index
}

func (ms MeasurementDeviceBindings) Swap(i, j int) {
	ms[i], ms[j] = ms[j], ms[i]
}
