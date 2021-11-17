package request

type AlarmFilter struct {
	DeviceID    uint   `json:"device_id"`
	AssetID     uint   `json:"asset_id"`
	AlarmLevels []uint `json:"levels"`
	Type        string `json:"type"`
}
