package request

type CreateAsset struct {
	Name       string                 `json:"name" binding:"max=20,min=2"`
	Type       uint                   `json:"type" binding:"required"`
	ParentID   uint                   `json:"parent_id,omitempty"`
	Attributes map[string]interface{} `json:"attributes"`

	ProjectID uint `json:"-"`
}

type UpdateAsset struct {
	Name       string                 `json:"name" binding:"max=20,min=2"`
	Type       uint                   `json:"type" binding:"required"`
	ParentID   uint                   `json:"parent_id,omitempty"`
	Attributes map[string]interface{} `json:"attributes"`
}
