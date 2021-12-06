package po

import (
	"github.com/thetasensors/theta-cloud-lite/server/pkg/measurement"
	"gorm.io/gorm"
)

type Measurement struct {
	gorm.Model
	Name     string `gorm:"type:varchar(64);"`
	Type     measurement.Type
	AssetID  uint
	Settings MeasurementSettings `gorm:"type:json"`
}

func (Measurement) TableName() string {
	return "ts_measurement"
}
