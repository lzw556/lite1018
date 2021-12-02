package vo

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
)

type AlarmRecord struct {
	ID           uint                   `json:"id"`
	Name         string                 `json:"name"`
	Device       map[string]interface{} `json:"device"`
	Property     Property               `json:"property"`
	Rule         AlarmRuleContent       `json:"rule"`
	Level        uint                   `json:"level"`
	Value        float32                `json:"value"`
	Content      string                 `json:"content"`
	Status       uint                   `json:"status"`
	Acknowledged bool                   `json:"acknowledged"`
	Timestamp    int64                  `json:"timestamp"`
	UpdatedAt    int64                  `json:"updatedAt"`
}

func NewAlarmRecord(e entity.AlarmRecord) AlarmRecord {
	return AlarmRecord{
		ID:           e.ID,
		Level:        e.Level,
		Rule:         NewAlarmRuleContent(e.Rule),
		Value:        e.Value,
		Timestamp:    e.CreatedAt.Unix(),
		UpdatedAt:    e.UpdatedAt.Unix(),
		Status:       uint(e.Status),
		Acknowledged: e.Acknowledged,
	}
}

func (r *AlarmRecord) SetProperty(e po.Property) {
	r.Property = NewProperty(e)
}

func (r *AlarmRecord) SetDevice(e entity.Device) {
	r.Device = map[string]interface{}{
		"id":     e.ID,
		"name":   e.Name,
		"typeId": e.TypeID,
	}
}
