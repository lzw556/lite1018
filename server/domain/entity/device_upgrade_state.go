package entity

type DeviceUpgradeStatus uint

const (
	DeviceUpgradeStatusInvalid DeviceUpgradeStatus = iota
	DeviceUpgradeStatusPending
	DeviceUpgradeStatusLoading
	DeviceUpgradeStatusUpgrading
	DeviceUpgradeStatusCancelled
	DeviceUpgradeStatusError
	DeviceUpgradeStatusSuccess
)

type DeviceUpgradeState struct {
	Progress float32             `json:"progress"`
	Status   DeviceUpgradeStatus `json:"status"`
}
