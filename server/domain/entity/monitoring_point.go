package entity

import (
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/cache"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/eventbus"
	"gorm.io/gorm"
)

type MonitoringPoint struct {
	gorm.Model
	Name      string `gorm:"type:varchar(64)"`
	Type      uint
	AssetID   uint
	ProjectID uint

	AlarmRuleStates map[uint]AlarmRuleState `gorm:"-"`
}

func (MonitoringPoint) TableName() string {
	return "ts_monitoring_point"
}

func (mp *MonitoringPoint) UpdateAlarmRuleState(e AlarmRule) {
	_ = cache.GetStruct(fmt.Sprintf("monitoring_point_alarm_rule_state_%d", mp.ID), &mp.AlarmRuleStates)
	if mp.AlarmRuleStates == nil {
		mp.AlarmRuleStates = make(map[uint]AlarmRuleState)
	}
	if state, ok := mp.AlarmRuleStates[e.ID]; ok {
		state.Level = e.Level
		state.Duration += 1
		mp.AlarmRuleStates[e.ID] = state
	} else {
		if mp.AlarmRuleStates[e.ID].Duration == e.Duration {

		}
		mp.AlarmRuleStates[e.ID] = AlarmRuleState{
			Level:    e.Level,
			Duration: 1,
		}
	}
	_ = cache.SetStruct(fmt.Sprintf("monitoring_point_alarm_rule_state_%d", mp.ID), mp.AlarmRuleStates)
}

func (mp *MonitoringPoint) RemoveAlarmRuleState(id uint) {
	_ = cache.GetStruct(fmt.Sprintf("monitoring_point_alarm_rule_state_%d", mp.ID), &mp.AlarmRuleStates)
	delete(mp.AlarmRuleStates, id)
	_ = cache.SetStruct(fmt.Sprintf("monitoring_point_alarm_rule_state_%d", mp.ID), mp.AlarmRuleStates)
}

func (mp *MonitoringPoint) GetAlarmRuleState(id uint) AlarmRuleState {
	_ = cache.GetStruct(fmt.Sprintf("monitoring_point_alarm_rule_state_%d", mp.ID), &mp.AlarmRuleStates)
	if mp.AlarmRuleStates == nil {
		return AlarmRuleState{}
	}
	return mp.AlarmRuleStates[id]
}

func (mp MonitoringPoint) AlertNotify(m AlarmRuleMetric, value float64, level uint8) {
	eventbus.Publish(eventbus.SocketEmit, "socket::monitoringPointAlertStateEvent", map[string]interface{}{
		"monitoringPoint": map[string]interface{}{
			"name": mp.Name,
			"id":   mp.ID,
		},
		"metric": m,
		"level":  level,
		"value":  value,
	})
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
