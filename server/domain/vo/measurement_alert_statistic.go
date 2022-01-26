package vo

type MeasurementAlertStatistic struct {
	Total     int `json:"total"`
	Today     int `json:"today"`
	Untreated int `json:"untreated"`
}
