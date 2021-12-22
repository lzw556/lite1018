package vo

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/measurementtype"
)

type Measurement struct {
	ID                     uint                 `json:"id"`
	Name                   string               `json:"name"`
	Type                   measurementtype.Type `json:"type"`
	Display                *Display             `json:"display,omitempty"`
	Data                   *MeasurementData     `json:"data,omitempty"`
	Alert                  *MeasurementAlert    `json:"alert,omitempty"`
	Settings               po.Settings          `json:"settings,omitempty"`
	SensorSettings         po.SensorSetting     `json:"sensorSettings,omitempty"`
	SamplePeriod           uint                 `json:"samplePeriod"`
	SamplePeriodTimeOffset uint                 `json:"samplePeriodTimeOffset"`
	Asset                  *Asset               `json:"asset,omitempty"`
}

func NewMeasurement(e po.Measurement) Measurement {
	m := Measurement{
		ID:                     e.ID,
		Name:                   e.Name,
		Type:                   e.Type,
		Settings:               e.Settings,
		SensorSettings:         e.SensorSettings,
		SamplePeriod:           e.SamplePeriod,
		SamplePeriodTimeOffset: e.SamplePeriodTimeOffset,
	}
	if e.Display != (po.Display{}) {
		display := NewDisplay(e.Display)
		m.Display = &display
	}
	return m
}

func (m *Measurement) SetData(e po.MeasurementData) {
	data := NewMeasurementData(e)
	for k, v := range e.Fields {
		if field, ok := measurementtype.Variables[m.Type][k]; ok {
			data.Fields = append(data.Fields, MeasurementField{
				Name:      k,
				Title:     field.Title,
				Value:     v,
				Unit:      field.Unit,
				Precision: field.Precision,
				Type:      uint(field.Type),
				Primary:   field.Primary,
			})
		}
	}
	m.Data = &data
}

func (m *Measurement) SetAlert(e entity.MeasurementAlert) {
	level := uint(0)
	for _, record := range e.Records {
		if level < record.Level {
			level = record.Level
		}
	}
	alert := NewMeasurementAlert(level)
	m.Alert = &alert
}

func (m *Measurement) SetAsset(e po.Asset) {
	asset := NewAsset(e)
	m.Asset = &asset
}
