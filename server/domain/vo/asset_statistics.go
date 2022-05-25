package vo

type AssetStatistics struct {
	AssetID uint `json:"assetId"`

	MonitoringPointNum uint `json:"monitoringPointNum"`
}

func NewAssetStatistics(assetId uint) AssetStatistics {
	return AssetStatistics{
		AssetID: assetId,
	}
}
