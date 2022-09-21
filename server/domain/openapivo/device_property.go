package openapivo

type DeviceProperty struct {
	Name string `json:"name,omitempty"`
	Key  string `json:"key,omitempty"`
	Unit string `json:"unit"`
}
