package factory

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/command"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/query"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
)

type Role struct {
	roleRepo dependency.RoleRepository
}

func NewRole() Role {
	return Role{
		roleRepo: repository.Role{},
	}
}

func (factory Role) NewRoleCmd(id uint) (*command.RoleCmd, error) {
	ctx := context.TODO()
	e, err := factory.roleRepo.Get(ctx, id)
	if err != nil {
		return nil, response.BusinessErr(errcode.RoleNotFoundError, "")
	}
	cmd := command.NewRoleCmd()
	cmd.Role = e
	return &cmd, nil
}

func (factory Role) NewRoleQuery(id uint) (*query.RoleQuery, error) {
	ctx := context.TODO()
	e, err := factory.roleRepo.Get(ctx, id)
	if err != nil {
		return nil, response.BusinessErr(errcode.RoleNotFoundError, "")
	}
	q := query.NewRoleQuery()
	q.Role = e
	return &q, nil
}
