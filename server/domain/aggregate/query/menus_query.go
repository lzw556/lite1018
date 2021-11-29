package query

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"sort"
)

type MenusQuery struct {
	po.Menus
}

func NewMenusQuery() MenusQuery {
	return MenusQuery{}
}

func (query MenusQuery) MenuTrees() vo.Menus {
	result := make(vo.Menus, 0)
	for _, e := range query.Menus {
		if e.ParentID == 0 {
			m := vo.NewMenu(e)
			m.AddChildren(query.Menus)
			result = append(result, m)
		}
	}
	sort.Sort(result)
	return result
}
