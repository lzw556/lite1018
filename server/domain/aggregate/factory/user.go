package factory

import (
	"context"
	"errors"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/command"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"gorm.io/gorm"
)

type User struct {
	userRepo dependency.UserRepository
}

func NewUser() User {
	return User{
		userRepo: repository.User{},
	}
}

func (factory User) NewUserCreateCmd(req request.User) (*command.UserCreateCmd, error) {
	ctx := context.TODO()
	e, err := factory.userRepo.GetBySpecs(ctx, spec.UsernameEqSpec(req.Username))
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, response.BusinessErr(errcode.UserExistsError, "")
	}
	e.Username = req.Username
	e.Password = req.Password
	e.Email = req.Email
	e.Phone = req.Phone
	e.RoleID = req.Role
	cmd := command.NewUserCreateCmd()
	cmd.User = e
	return &cmd, nil
}

func (factory User) NewUserDeleteCmd(id uint) (*command.UserDeleteCmd, error) {
	ctx := context.TODO()
	e, err := factory.userRepo.Get(ctx, id)
	if err != nil {
		return nil, response.BusinessErr(errcode.UserNotFoundError, "")
	}
	cmd := command.NewUserDeleteCmd()
	cmd.User = e
	return &cmd, nil
}
