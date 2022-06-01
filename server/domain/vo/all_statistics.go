package vo

type AllStatistics struct {
	DeviceNum               uint `json:"deviceNum"`
	DeviceAlarmNum          uint `json:"deviceAlarmNum"`
	RootAssetNum            uint `json:"rootAssetNum"`
	RootAssetAlarmNum       uint `json:"rootAssetAlarmNum"`
	MonitoringPointNum      uint `json:"monitoringPointNum"`
	MonitoringPointAlarmNum uint `json:"monitoringPointAlarmNum"`
}
