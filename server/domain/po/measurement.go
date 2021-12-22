package po

import (
	"github.com/thetasensors/theta-cloud-lite/server/pkg/measurementtype"
	"gorm.io/gorm"
)

type Measurement struct {
	gorm.Model
	Name                   string `gorm:"type:varchar(64);"`
	Type                   measurementtype.Type
	AssetID                uint
	Settings               Settings      `gorm:"type:json"`
	SensorSettings         SensorSetting `gorm:"type:json"`
	SamplePeriod           uint          `gorm:"not null;default:1200000"`
	SamplePeriodTimeOffset uint          `gorm:"not null;default:0"`
	Display                Display       `gorm:"type:json"`
}

func (Measurement) TableName() string {
	return "ts_measurement"
}

type Measurements []Measurement
