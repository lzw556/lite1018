package request

type AlarmRuleTemplate struct {
	Name        string           `json:"name"`
	DeviceType  uint             `json:"device_type"`
	Description string           `json:"description"`
	PropertyID  uint             `json:"property_id"`
	Rule        AlarmRuleContent `json:"rule"`
	Level       uint             `json:"level"`
}

type AlarmRuleContent struct {
	Field     string  `json:"field"`
	Method    string  `json:"method"`
	Operation string  `json:"operation"`
	Threshold float32 `json:"threshold"`
}

type AlarmRule struct {
	Name        string           `json:"name"`
	Description string           `json:"description"`
	DeviceIDs   []uint           `json:"device_ids"`
	PropertyID  uint             `json:"property_id"`
	CreateType  uint             `json:"create_type"`
	DeviceType  uint             `json:"device_type"`
	Rule        AlarmRuleContent `json:"rule"`
	TemplateIDs []uint           `json:"template_ids"`
	Level       uint             `json:"level"`
}

type UpdateAlarmRule struct {
	Rule struct {
		Operation string  `json:"operation"`
		Threshold float32 `json:"threshold"`
	} `json:"rule"`
	Level uint `json:"level"`
}
