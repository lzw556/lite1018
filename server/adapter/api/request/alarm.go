package request

type AlarmTemplate struct {
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Rule        AlarmRule `json:"rule"`
	Level       uint      `json:"level"`

	ProjectID uint `json:"-"`
}

type AlarmRule struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	SourceIDs   []uint `json:"source_ids"`
	SourceType  string `json:"source_type"`
	Duration    int    `json:"duration"`
	Metric      struct {
		Key  string `json:"key"`
		Name string `json:"name"`
	} `json:"metric"`
	Operation string  `json:"operation"`
	Threshold float64 `json:"threshold"`
	Level     uint8   `json:"level"`
}

type CreateAlarmFromTemplate struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	TemplateIDs []uint `json:"template_ids"`
}

type AcknowledgeAlarmRecord struct {
	UserID uint   `json:"user_id"`
	Note   string `json:"note"`
}
