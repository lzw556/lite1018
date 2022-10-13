package openapivo

type AlertState struct {
	Rule struct {
		ID    uint  `json:"id"`
		Level uint8 `json:"level"`
	} `json:"rule"`
	Record struct {
		ID    uint        `json:"id"`
		Value interface{} `json:"value"`
	} `json:"record"`
}
