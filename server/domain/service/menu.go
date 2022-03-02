package service

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/menu"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/factory"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"sort"
)

type Menu struct {
	repository dependency.MenuRepository
	factory    factory.Menu
}

func NewMenu() menu.Service {
	return Menu{
		repository: repository.Menu{},
		factory:    factory.NewMenu(),
	}
}

func (s Menu) GetMenusByUserID(userID uint) (vo.Menus, error) {
	query, err := s.factory.NewMenuQueryByUserID(userID)
	if err != nil {
		return nil, err
	}
	return query.MenuTrees(), nil
}

func (s Menu) GetMenusTree() (vo.Menus, error) {
	es, err := s.repository.Find(context.TODO())
	if err != nil {
		return nil, err
	}
	result := make(vo.Menus, 0)
	for _, e := range es {
		if e.ParentID == 0 {
			m := vo.NewMenu(e)
			m.AddChildren(es)
			result = append(result, m)
		}
	}
	sort.Sort(result)
	return result, nil
}
