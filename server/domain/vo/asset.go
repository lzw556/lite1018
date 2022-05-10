package vo

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type Asset struct {
	ID        uint
	Name      string
	Type      uint
	ParentID  uint
	ProjectID uint
}

func NewAsset(e entity.Asset) Asset {
	return Asset{
		ID:        e.ID,
		Name:      e.Name,
		Type:      e.Type,
		ParentID:  e.ParentID,
		ProjectID: e.ProjectID,
	}
}
