package openapivo

type AlarmRuleGroup struct {
	ID          uint   `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Category    uint   `json:"category"`
	Type        uint   `json:"type"`

	Rules []*AlarmRule `json:"rules"`
}
