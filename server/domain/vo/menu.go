package vo

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"sort"
)

type Menu struct {
	ID       uint   `json:"id"`
	Title    string `json:"title"`
	Name     string `json:"name"`
	Path     string `json:"path"`
	Icon     string `json:"icon"`
	Hidden   bool   `json:"hidden"`
	IsAuth   bool   `json:"isAuth"`
	Sort     int    `json:"sort"`
	View     string `json:"view"`
	Children Menus  `json:"children"`
}

func NewMenu(e entity.Menu) Menu {
	return Menu{
		ID:       e.ID,
		Title:    e.Title,
		Name:     e.Name,
		Hidden:   e.Hidden,
		IsAuth:   e.IsAuth,
		Icon:     e.Icon,
		Path:     e.Path,
		View:     e.View,
		Sort:     e.Sort,
		Children: make([]Menu, 0),
	}
}

func (m *Menu) AddChildren(es []entity.Menu) {
	for _, e := range es {
		if e.ParentID == m.ID {
			child := NewMenu(e)
			child.AddChildren(es)
			sort.Sort(child.Children)
			m.Children = append(m.Children, child)
		}
	}
}

type Menus []Menu

func NewMenus(es []entity.Menu) Menus {
	ms := make(Menus, 0)
	for _, e := range es {
		if e.ParentID == 0 {
			m := NewMenu(e)
			m.AddChildren(es)
			ms = append(ms, m)
		}
	}
	sort.Sort(ms)
	return ms
}
func (m Menus) Len() int {
	return len(m)
}

func (m Menus) Less(i, j int) bool {
	return m[i].Sort < m[j].Sort
}

func (m Menus) Swap(i, j int) {
	m[i], m[j] = m[j], m[i]
}
