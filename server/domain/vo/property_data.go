package vo

type PropertyData struct {
	Timestamp int64       `json:"timestamp"`
	Value     interface{} `json:"value"`
}

type PropertiesData map[string][]PropertyData
