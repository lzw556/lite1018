package query

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/casbin"
	"math"
)

type RoleQuery struct {
	entity.Role

	roleMenuRepo dependency.RoleMenuRelationRepository
}

func NewRoleQuery() RoleQuery {
	return RoleQuery{
		roleMenuRepo: repository.RoleMenuRelation{},
	}
}

func (query RoleQuery) Detail() (*vo.Role, error) {
	result := vo.NewRole(query.Role)
	es, err := query.roleMenuRepo.FindBySpecs(context.TODO(), spec.RoleEqSpec(query.Role.ID))
	if err != nil {
		return nil, err
	}
	result.SetMenus(es)

	rules := casbin.GetFilteredPolicy(query.Role.Name)
	result.SetPermissions(rules)
	return &result, nil
}

func (query RoleQuery) Casbin() *vo.Casbin {
	name := query.Role.Name
	rules := casbin.GetFilteredPolicy(name)
	if query.Role.ID == math.MaxInt {
		name = "admin"
	}
	result := vo.NewCasbin(name, "")
	result.SetRules(rules)
	return &result
}
