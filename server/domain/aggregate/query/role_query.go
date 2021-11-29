package query

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type RoleQuery struct {
	po.Role

	roleMenuRepo dependency.RoleMenuRelationRepository
}

func NewRoleQuery() RoleQuery {
	return RoleQuery{
		roleMenuRepo: repository.RoleMenuRelation{},
	}
}

func (query RoleQuery) GetWithMenus() (*vo.Role, error) {
	result := vo.NewRole(query.Role)
	es, err := query.roleMenuRepo.FindBySpecs(context.TODO(), spec.RoleEqSpec(query.Role.ID))
	if err != nil {
		return nil, err
	}
	result.SetMenus(es)
	return &result, nil
}
