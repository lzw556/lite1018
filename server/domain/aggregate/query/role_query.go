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
	"strconv"
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

	e := casbin.Enforcer()
	rules := e.GetFilteredPolicy(0, strconv.Itoa(int(query.Role.ID)))
	result.SetPermissions(rules)
	return &result, nil
}

func (query RoleQuery) Casbin() *vo.Casbin {
	roleID := strconv.Itoa(int(query.Role.ID))
	e := casbin.Enforcer()
	rules := e.GetFilteredPolicy(0, roleID)
	if query.Role.ID == math.MaxInt {
		roleID = "admin"
	}
	result := vo.NewCasbin(roleID, casbin.Model())
	result.SetRules(rules)
	return &result
}
