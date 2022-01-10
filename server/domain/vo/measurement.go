package vo

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/measurementtype"
)

type Measurement struct {
	ID             uint               `json:"id"`
	Name           string             `json:"name"`
	Type           uint               `json:"type"`
	Display        *Display           `json:"display,omitempty"`
	Data           *MeasurementData   `json:"data,omitempty"`
	Alert          *MeasurementAlert  `json:"alert,omitempty"`
	Settings       po.Settings        `json:"settings,omitempty"`
	SensorSettings po.SensorSetting   `json:"sensorSettings,omitempty"`
	Mode           po.AcquisitionMode `json:"mode"`
	PollingPeriod  uint               `json:"polling_period"`
	Asset          *Asset             `json:"asset,omitempty"`
	Devices        []Device           `json:"devices"`
}

func NewMeasurement(e po.Measurement) Measurement {
	m := Measurement{
		ID:             e.ID,
		Name:           e.Name,
		Type:           e.Type,
		Settings:       e.Settings,
		SensorSettings: e.SensorSettings,
		Mode:           e.Mode,
		PollingPeriod:  e.PollingPeriod,
		Devices:        make([]Device, 0),
	}
	if e.Display != (po.Display{}) {
		display := NewDisplay(e.Display)
		m.Display = &display
	}
	return m
}

func (m *Measurement) SetData(e entity.MeasurementData) {
	data := NewMeasurementData(e)
	if t := measurementtype.Get(m.Type); t != nil {
		for k, v := range e.Fields {
			if variable, err := t.Variables().GetByName(k); err == nil {
				data.Fields = append(data.Fields, MeasurementField{
					Variable: variable,
					Value:    v,
				})
			}
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

func (m *Measurement) SetDevices(es entity.Devices) {
	m.Devices = make([]Device, len(es))
	for i, e := range es {
		m.Devices[i] = NewDevice(e)
	}
}
