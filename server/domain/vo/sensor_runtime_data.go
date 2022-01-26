package vo

type SensorRuntimeData struct {
	Timestamp      int64   `json:"timestamp"`
	BatteryVoltage int     `json:"batteryVoltage"`
	SignalStrength float32 `json:"signalStrength"`
}
