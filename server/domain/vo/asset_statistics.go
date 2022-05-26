package vo

type AssetStatistics struct {
	AssetID uint `json:"assetId"`

	MonitoringPointNum uint   `json:"monitoringPointNum"`
	AlarmNum           []uint `json:"alarmNum"`
	DeviceNum          uint   `json:"deviceNum"`
	OfflineDeviceNum   uint   `json:"offlineDeviceNum"`
}

func NewAssetStatistics(assetId uint) AssetStatistics {
	return AssetStatistics{
		AssetID:  assetId,
		AlarmNum: make([]uint, 3),
	}
}
