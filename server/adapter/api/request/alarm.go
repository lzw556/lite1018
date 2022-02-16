package request

type AlarmTemplate struct {
	Name            string    `json:"name"`
	MeasurementType uint      `json:"measurement_type"`
	Description     string    `json:"description"`
	Rule            AlarmRule `json:"rule"`
	Level           uint      `json:"level"`

	ProjectID uint `json:"-"`
}

type AlarmRule struct {
	Field     string  `json:"field"`
	Method    string  `json:"method"`
	Operation string  `json:"operation"`
	Threshold float32 `json:"threshold"`
}

type CreateAlarm struct {
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Type        uint8     `json:"type"`
	SourceIDs   []uint    `json:"source_ids"`
	Rule        AlarmRule `json:"rule"`
	Level       uint      `json:"level"`
}

type CreateAlarmFromTemplate struct {
	Name           string `json:"name"`
	Description    string `json:"description"`
	TemplateIDs    []uint `json:"template_ids"`
	MeasurementIDs []uint `json:"measurement_ids"`
}

type UpdateAlarm struct {
	Rule struct {
		Operation string  `json:"operation"`
		Threshold float32 `json:"threshold"`
	} `json:"rule"`
	Level uint `json:"level"`
}

type AcknowledgeAlarmRecord struct {
	UserID uint   `json:"user_id"`
	Note   string `json:"note"`
}
