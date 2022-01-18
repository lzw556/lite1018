package vo

type MeasurementSettings struct {
	Settings       map[string]interface{} `json:"settings"`
	SensorSettings DeviceSettings         `json:"sensorSettings"`
}
