package vo

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/measurementtype"
)

type AlarmRecord struct {
	ID           uint             `json:"id"`
	Name         string           `json:"name"`
	Measurement  Measurement      `json:"measurement"`
	Field        MeasurementField `json:"field"`
	Rule         AlarmRule        `json:"rule"`
	Level        uint             `json:"level"`
	Value        float32          `json:"value"`
	Content      string           `json:"content"`
	Status       uint             `json:"status"`
	Acknowledged bool             `json:"acknowledged"`
	Timestamp    int64            `json:"timestamp"`
	UpdatedAt    int64            `json:"updatedAt"`
}

func NewAlarmRecord(e entity.AlarmRecord) AlarmRecord {
	return AlarmRecord{
		ID:           e.ID,
		Level:        e.Level,
		Rule:         NewAlarmRule(e.Rule),
		Value:        e.Value,
		Timestamp:    e.CreatedAt.Unix(),
		UpdatedAt:    e.UpdatedAt.Unix(),
		Status:       uint(e.Status),
		Acknowledged: e.Acknowledged,
	}
}

func (r *AlarmRecord) SetMeasurement(e po.Measurement) {
	r.Measurement = NewMeasurement(e)
}

func (r *AlarmRecord) SetField(e measurementtype.Variable) {
	r.Field = NewMeasurementField(e)
}
