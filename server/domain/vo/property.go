package vo

import "github.com/thetasensors/theta-cloud-lite/server/domain/po"

type Property struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
}

func NewProperty(e po.Property) Property {
	return Property{
		ID:   e.ID,
		Name: e.Name,
	}
}
