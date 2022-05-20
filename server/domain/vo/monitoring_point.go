package vo

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type MonitoringPoint struct {
	ID         uint                   `json:"id"`
	Name       string                 `json:"name"`
	Type       uint                   `json:"type"`
	AssetID    uint                   `json:"assetId"`
	Attributes map[string]interface{} `json:"attributes"`

	Properties MPProperties         `json:"properties"`
	Data       *MonitoringPointData `json:"data"`
}

func NewMonitoringPoint(e entity.MonitoringPoint) MonitoringPoint {
	return MonitoringPoint{
		ID:         e.ID,
		Name:       e.Name,
		Type:       e.Type,
		AssetID:    e.AssetID,
		Attributes: e.Attributes,
	}
}
