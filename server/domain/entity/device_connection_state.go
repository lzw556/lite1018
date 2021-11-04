package entity

type DeviceConnectionState struct {
	IsOnline    bool  `json:"isOnline"`
	ConnectedAt int64 `json:"connectedAt"`
}
