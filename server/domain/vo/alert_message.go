package vo

type AlertMessage struct {
	Title     string `json:"title"`
	Device    string `json:"device"`
	Field     string `json:"field"`
	Value     string `json:"value"`
	Operation string `json:"operation"`
	Threshold string `json:"threshold"`
}

func NewAlertMessage(device string, field string, value string, operation string, threshold string) AlertMessage {
	return AlertMessage{
		Device:    device,
		Field:     field,
		Value:     value,
		Operation: operation,
		Threshold: threshold,
	}
}
