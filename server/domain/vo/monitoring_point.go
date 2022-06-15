package vo

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type MonitoringPoint struct {
	ID      uint   `json:"id"`
	Name    string `json:"name"`
	Type    uint   `json:"type"`
	AssetID uint   `json:"assetId"`

	Attributes     map[string]interface{} `json:"attributes,omitempty"`
	BindingDevices []*Device              `json:"bindingDevices,omitempty"`
	Properties     MPProperties           `json:"properties,omitempty"`
	Data           *MonitoringPointData   `json:"data,omitempty"`
	AlertStates    []AlertState           `json:"alertStates,omitempty"`
	AlertLevel     uint                   `json:"alertLevel"`
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

func (m *MonitoringPoint) SetAlertStates(es []entity.MonitoringPointAlertState) {
	m.AlertStates = make([]AlertState, len(es))
	var maxLevel uint = 0
	for i, e := range es {
		m.AlertStates[i].Rule.Level = e.Rule.Level
		m.AlertStates[i].Rule.ID = e.Rule.ID
		m.AlertStates[i].Record.ID = e.Record.ID
		m.AlertStates[i].Record.Value = e.Record.Value

		if uint(e.Rule.Level) > maxLevel {
			maxLevel = uint(e.Rule.Level)
		}
	}

	m.AlertLevel = maxLevel
}
