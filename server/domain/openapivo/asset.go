package openapivo

type Asset struct {
	ID         uint                   `json:"id"`
	Name       string                 `json:"name"`
	Type       uint                   `json:"type"`
	ParentID   uint                   `json:"parentId"`
	Attributes map[string]interface{} `json:"attributes,omitempty"`
}
