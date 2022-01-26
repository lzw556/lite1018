package vo

import "github.com/thetasensors/theta-cloud-lite/server/domain/po"

type Asset struct {
	ID       uint     `json:"id"`
	Name     string   `json:"name"`
	ParentID uint     `json:"parentId"`
	Image    string   `json:"image"`
	Display  *Display `json:"display,omitempty"`
	Parent   *Asset   `json:"parent,omitempty"`
}

func NewAsset(e po.Asset) Asset {
	a := Asset{
		ID:       e.ID,
		Name:     e.Name,
		ParentID: e.ParentID,
		Image:    e.Image,
	}
	if e.Display != (po.Display{}) {
		d := NewDisplay(e.Display)
		a.Display = &d
	}
	return a
}

func (a *Asset) SetParent(e po.Asset) {
	parent := NewAsset(e)
	a.Parent = &parent
}
