package request

type CreateMeasurement struct {
	Name                   string                 `json:"name"`
	Type                   uint                   `json:"type"`
	Asset                  uint                   `json:"asset"`
	Settings               map[string]interface{} `json:"settings"`
	Sensors                map[string]interface{} `json:"sensors"`
	SamplePeriod           uint                   `json:"sample_period"`
	SamplePeriodTimeOffset uint                   `json:"sample_period_time_offset"`
	BindingDevices         []BindingDevice        `json:"binding_devices"`
	DeviceType             uint                   `json:"device_type"`
	Location               struct {
		X float32 `json:"x"`
		Y float32 `json:"y"`
	} `json:"location"`
}

type UpdateMeasurementDeviceBindings struct {
	DeviceType     uint            `json:"device_type"`
	BindingDevices []BindingDevice `json:"binding_devices"`
}

type BindingDevice struct {
	Index uint   `json:"index"`
	Value string `json:"value"`
}

type MeasurementSettings map[string]interface{}
