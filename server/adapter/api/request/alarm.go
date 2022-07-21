package request

type AlarmTemplate struct {
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Rule        AlarmRule `json:"rule"`
	Level       uint      `json:"level"`

	ProjectID uint `json:"-"`
}

type AlarmRule struct {
	ID          uint   `josn:"id,omitempty"`
	Name        string `json:"name,omitempty" binding:"omitempty,max=16,min=4"`
	Description string `json:"description"`
	SourceIDs   []uint `json:"source_ids"`
	SourceType  uint   `json:"source_type"`
	Duration    int    `json:"duration"`
	Metric      struct {
		Key  string `json:"key"`
		Name string `json:"name"`
		Unit string `json:"unit"`
	} `json:"metric"`
	Operation string  `json:"operation"`
	Threshold float64 `json:"threshold"`
	Category  uint8   `json:"category"`
	Level     uint8   `json:"level"`

	ProjectID uint `json:"-"`
}

type AlarmSources struct {
	IDs []uint `json:"ids"`
}

type CreateAlarmFromTemplate struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	TemplateIDs []uint `json:"template_ids"`
}

type AcknowledgeAlarmRecord struct {
	UserID uint `json:"-"`

	Note string `json:"note"`
}

type AlarmRuleGroup struct {
	Name        string      `json:"name"`
	Description string      `json:"description"`
	Rules       []AlarmRule `json:"rules"`
	Category    uint        `json:"category"`
	Type        uint        `json:"type"`

	ProjectID uint `json:"-"`
}

type AlarmRuleGroupBinding struct {
	AlarmRuleID uint `json:"alarm_rule_id"`
	SourceID    uint `json:"source_id"`
}

type AlarmRuleGroupBind struct {
	MonitoringPointIDs []uint `json:"monitoring_point_ids"`
}

type AlarmRuleGroupUnbind struct {
	MonitoringPointIDs []uint `json:"monitoring_point_ids"`
}

type UpdateAlarmRuleGroup struct {
	Name        string      `json:"name"`
	Description string      `json:"description"`
	Rules       []AlarmRule `json:"rules"`
	Category    uint        `json:"category"`
	Type        uint        `json:"type"`

	ProjectID uint `json:"-"`
}

type UpdateAlarmRuleGroupBindings struct {
	MonitoringPointIDs []uint `json:"monitoring_point_ids"`
}

type AlarmRuleGroupImported struct {
	Name        string      `json:"name"`
	Description string      `json:"description"`
	Category    uint        `json:"category"`
	Type        uint        `json:"type"`
	Rules       []AlarmRule `json:"rules"`
}

type AlarmRuleGroupsImported struct {
	AlarmRuleGroups []AlarmRuleGroupImported `json:"alarmRuleGroups"`

	ProjectID uint `json:"-"`
}
