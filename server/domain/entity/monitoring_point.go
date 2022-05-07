package entity

import (
	"gorm.io/gorm"
)

const (
	MonitoringPointTypeGeneral = iota + 1
	MonitoringPointTypeBoltAngle
	MonitoringPointTypePreload
	MonitoringPointTypeDynamicPreload
	MonitoringPointTypeUnknown
)

type MonitoringPoint struct {
	gorm.Model
	Name      string `gorm:"type:varchar(64)"`
	Type      uint
	AssetID   uint
	ProjectID uint
}

func (MonitoringPoint) TableName() string {
	return "ts_monitoring_point"
}
