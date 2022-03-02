package factory

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/query"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
)

type Menu struct {
	menuRepo     dependency.MenuRepository
	userRepo     dependency.UserRepository
	roleMenuRepo dependency.RoleMenuRelationRepository
}

func NewMenu() Menu {
	return Menu{
		menuRepo:     repository.Menu{},
		userRepo:     repository.User{},
		roleMenuRepo: repository.RoleMenuRelation{},
	}
}

func (factory Menu) NewMenuQueryByUserID(id uint) (*query.MenuQuery, error) {
	ctx := context.TODO()
	var err error
	q := query.NewMenuQuery()
	user, err := factory.userRepo.Get(ctx, id)
	if err != nil {
		return nil, response.BusinessErr(errcode.UserNotFoundError, "")
	}
	if user.ID == 1 {
		q.Menus, err = factory.menuRepo.Find(ctx)
	} else {
		roleMenus, err := factory.roleMenuRepo.FindBySpecs(ctx, spec.RoleEqSpec(user.RoleID))
		if err != nil {
			return nil, err
		}
		menuIDs := make([]uint, len(roleMenus))
		for i, roleMenu := range roleMenus {
			menuIDs[i] = roleMenu.MenuID
		}
		q.Menus, err = factory.menuRepo.FindBySpecs(ctx, spec.PrimaryKeyInSpec(menuIDs))
	}
	return &q, err
}
