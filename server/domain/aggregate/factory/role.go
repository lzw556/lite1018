package factory

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/command"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/query"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"math"
)

type Role struct {
	roleRepo dependency.RoleRepository
	userRepo dependency.UserRepository
}

func NewRole() Role {
	return Role{
		roleRepo: repository.Role{},
		userRepo: repository.User{},
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

func (factory Role) NewRoleQueryByUserID(userID uint) (*query.RoleQuery, error) {
	ctx := context.TODO()
	user, err := factory.userRepo.Get(ctx, userID)
	if err != nil {
		return nil, response.BusinessErr(errcode.UserNotFoundError, "")
	}
	q := query.NewRoleQuery()
	if user.ID == 1 {
		q.Role.ID = math.MaxInt
	} else {
		e, err := factory.roleRepo.Get(ctx, user.RoleID)
		if err != nil {
			return nil, response.BusinessErr(errcode.RoleNotFoundError, "")
		}
		q.Role = e
	}
	return &q, nil
}
