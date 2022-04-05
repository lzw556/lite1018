package request

type AlarmTemplate struct {
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Rule        AlarmRule `json:"rule"`
	Level       uint      `json:"level"`

	ProjectID uint `json:"-"`
}

type AlarmRule struct {
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
