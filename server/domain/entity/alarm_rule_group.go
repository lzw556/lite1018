package entity

import (
	"gorm.io/gorm"
)

const (
	AlarmRuleGroupTypeDevice = iota + 1
	AlarmRuleGroupTypeMonitoringPoint
)

type AlarmRuleGroup struct {
	gorm.Model
	Name        string `gorm:"type:varchar(30)"`
	Description string `gorm:"type:varchar(128)"`
	Category    uint
	Type        uint
	ProjectID   uint

	Status uint8 `gorm:"default:1;not null"`
}

func (AlarmRuleGroup) TableName() string {
	return "ts_alarm_rule_group"
}

func (g AlarmRuleGroup) IsEnabled() bool {
	return g.Status == 1
}

type AlarmRuleGroups []AlarmRuleGroup

func (g AlarmRuleGroups) Len() int {
	return len(g)
}

func (g AlarmRuleGroups) Less(i, j int) bool {
	return g[i].ID < g[j].ID
}

func (g AlarmRuleGroups) Swap(i, j int) {
	g[i], g[j] = g[j], g[i]
}
