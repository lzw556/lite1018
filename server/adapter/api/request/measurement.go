package request

type CreateMeasurement struct {
	Name           string                 `json:"name"`
	Type           uint                   `json:"type"`
	Asset          uint                   `json:"asset"`
	Settings       map[string]interface{} `json:"settings"`
	Sensors        map[string]interface{} `json:"sensors"`
	Mode           uint                   `json:"acquisition_mode"`
	PollingPeriod  uint                   `json:"polling_period"`
	BindingDevices []BindingDevice        `json:"binding_devices"`
	DeviceType     uint                   `json:"device_type"`
	Location       struct {
		X float32 `json:"x"`
		Y float32 `json:"y"`
	} `json:"location"`
	ProjectID uint `json:"-"`
}

type UpdateMeasurementDeviceBindings struct {
	DeviceType     uint            `json:"device_type"`
	BindingDevices []BindingDevice `json:"binding_devices"`
}

type BindingDevice struct {
	Index uint   `json:"index"`
	Value string `json:"value"`
}

type MeasurementSettings struct {
	Sensors  map[string]interface{} `json:"sensors"`
	Settings map[string]interface{} `json:"settings"`
}
