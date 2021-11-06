package vo

type Alert struct {
	Title   string                 `json:"title"`
	Content string                 `json:"content"`
	Level   uint                   `json:"level"`
	Field   string                 `json:"field"`
	Data    map[string]interface{} `json:"data"`
}

func NewAlert() Alert {
	return Alert{
		Data: map[string]interface{}{},
	}
}
