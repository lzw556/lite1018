package openapivo

type AlarmRuleGroup struct {
	ID          uint   `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Category    uint   `json:"category"`
	Type        uint   `json:"type"`
	Enabled     bool   `json:"Enabled"`

	Rules []*AlarmRule `json:"rules"`
}
