package po

import "gorm.io/gorm"

type MeasurementType uint

const (
	BoltLooseningMeasurementType MeasurementType = iota + 1
	BoltElongationMeasurementType
	CorrosionThicknessMeasurementType
	PressureMeasurementType
	FlangeLooseningMeasurementType
	FlangeElongationMeasurementType
)

type Measurement struct {
	gorm.Model
	Name string `gorm:"type:varchar(64);"`
	Type uint
}

func (Measurement) TableName() string {
	return "ts_measurement"
}
