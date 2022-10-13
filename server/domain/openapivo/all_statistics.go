package openapivo

type AllStatistics struct {
  DeviceNum               uint   `json:"deviceNum"`
  DeviceOfflineNum        uint   `json:"deviceOfflineNum"`
  RootAssetNum            uint   `json:"rootAssetNum"`
  RootAssetAlarmNum       []uint `json:"rootAssetAlarmNum"`
  MonitoringPointNum      uint   `json:"monitoringPointNum"`
  MonitoringPointAlarmNum []uint `json:"monitoringPointAlarmNum"`
}
