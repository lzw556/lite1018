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

type MonitoringPoints []MonitoringPoint

func (mps MonitoringPoints) Len() int {
	return len(mps)
}

func (mps MonitoringPoints) Less(i, j int) bool {
	return mps[i].ID < mps[j].ID
}

func (mps MonitoringPoints) Swap(i, j int) {
	mps[i], mps[j] = mps[j], mps[i]
}
