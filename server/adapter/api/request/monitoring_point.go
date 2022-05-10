package request

type CreateMonitoringPoint struct {
	Name    string `json:"name" binding:"max=20,min=2"`
	Type    uint   `json:"type" binding:"required"`
	AssetID uint   `json:"asset_id" binding:"required"`

	ProjectID uint `json:"-"`
}

type UpdateMonitoringPoint struct {
	Name    string `json:"name" binding:"max=20,min=2"`
	Type    uint   `json:"type" binding:"required"`
	AssetID uint   `json:"asset_id" binding:"required"`
}
