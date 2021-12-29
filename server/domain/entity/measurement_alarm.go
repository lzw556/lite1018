package entity

import "github.com/thetasensors/theta-cloud-lite/server/domain/po"

type MeasurementAlarm struct {
	ID    uint         `json:"id"`
	Rule  po.AlarmRule `json:"rule"`
	Level uint         `json:"level"`
}
