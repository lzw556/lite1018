package vo

import "github.com/thetasensors/theta-cloud-lite/server/domain/po"

type Role struct {
	ID          uint   `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Menus       []uint `json:"menus"`
}

func NewRole(e po.Role) Role {
	return Role{
		ID:          e.ID,
		Name:        e.Name,
		Description: e.Description,
	}
}

func (r *Role) SetMenus(es []po.RoleMenuRelation) {
	r.Menus = make([]uint, len(es))
	for i, e := range es {
		r.Menus[i] = e.MenuID
	}
}
