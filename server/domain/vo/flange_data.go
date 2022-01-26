package vo

type FlangeData struct {
	Num       int       `json:"num"`
	Values    []float64 `json:"values"`
	Timestamp int64     `json:"timestamp"`
}
