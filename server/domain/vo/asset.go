package vo

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type Asset struct {
	ID         uint                   `json:"id"`
	Name       string                 `json:"name"`
	Type       uint                   `json:"type"`
	ParentID   uint                   `json:"parentId"`
	ProjectID  uint                   `json:"projectId"`
	Attributes map[string]interface{} `json:"attributes,omitempty"`

	Children         []*Asset           `json:"children,omitempty"`
	MonitoringPoints []*MonitoringPoint `json:"monitoringPoints,omitempty"`
	Statistics       AssetStatistics    `json:"statistics,omitempty"`
}

func NewAsset(e entity.Asset) Asset {
	return Asset{
		ID:         e.ID,
		Name:       e.Name,
		Type:       e.Type,
		ParentID:   e.ParentID,
		ProjectID:  e.ProjectID,
		Attributes: e.Attributes,
	}
}
