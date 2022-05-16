package entity

type DeviceUpgradeCode int8

const (
	DeviceUpgradeInvalid DeviceUpgradeCode = iota
	DeviceUpgradePending
	DeviceUpgradeLoading
	DeviceUpgradeUpgrading
	DeviceUpgradeCancelled
	DeviceUpgradeError
	DeviceUpgradeSuccess
)

type DeviceUpgradeStatus struct {
	Progress float32           `json:"progress"`
	Code     DeviceUpgradeCode `json:"code"`
}
