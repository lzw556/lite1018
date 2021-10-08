package vo

import "github.com/thetasensors/theta-cloud-lite/server/domain/po"

type Asset struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
}

func NewAsset(e po.Asset) Asset {
	return Asset{
		ID:   e.ID,
		Name: e.Name,
	}
}
