package vo

import "github.com/thetasensors/theta-cloud-lite/server/domain/po"

type Role struct {
	ID          uint        `json:"id"`
	Name        string      `json:"name"`
	Description string      `json:"description"`
	Menus       []uint      `json:"menus"`
	Permissions [][2]string `json:"permissions"`
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

func (r *Role) SetPermissions(rules [][]string) {
	r.Permissions = [][2]string{}
	for _, rule := range rules {
		r.Permissions = append(r.Permissions, [2]string{rule[1], rule[2]})
	}
}
