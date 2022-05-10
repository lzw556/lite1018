package vo

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type MonitoringPoint struct {
	ID      uint
	Name    string
	Type    uint
	AssetID uint
}

func NewMonitoringPoint(e entity.MonitoringPoint) MonitoringPoint {
	return MonitoringPoint{
		ID:      e.ID,
		Name:    e.Name,
		Type:    e.Type,
		AssetID: e.AssetID,
	}
}
