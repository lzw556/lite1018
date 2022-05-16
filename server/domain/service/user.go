package service

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/user"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/factory"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/jwt"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	repository dependency.UserRepository
	factory    factory.User
}

func NewUser() user.Service {
	return User{
		repository: repository.User{},
		factory:    factory.NewUser(),
	}
}

func (s User) Login(req request.Login) (*vo.AccessToken, error) {
	ctx := context.TODO()
	e, err := s.repository.GetBySpecs(ctx, spec.UsernameEqSpec(req.Username))
	if err != nil {
		return nil, response.BusinessErr(errcode.UserNotFoundError, err.Error())
	}
	if err := bcrypt.CompareHashAndPassword([]byte(e.Password), []byte(req.Password)); err != nil {
		return nil, response.BusinessErr(errcode.InvalidUsernameOrPasswordError, err.Error())
	}
	token, err := jwt.GenerateToken(e.ID, e.Username, e.RoleID)
	if err != nil {
		return nil, response.BusinessErr(errcode.InvalidUsernameOrPasswordError, err.Error())
	}
	result := vo.NewAccessToken(token)
	result.SetUser(e)
	return &result, nil
}

func (s User) CreateUser(req request.User) error {
	cmd, err := s.factory.NewUserCreateCmd(req)
	if err != nil {
		return err
	}
	return cmd.Run(req.Projects)
}

func (s User) UpdateUserByID(userID uint, req request.UpdateUser) (*vo.User, error) {
	ctx := context.TODO()
	e, err := s.repository.Get(ctx, userID)
	if err != nil {
		return nil, response.BusinessErr(errcode.UserNotFoundError, "")
	}
	e.Email = req.Email
	e.Phone = req.Phone
	e.RoleID = req.Role
	if err := s.repository.Save(ctx, &e); err != nil {
		return nil, err
	}
	result := vo.NewUser(e)
	return &result, nil
}

func (s User) GetUserByID(userID uint) (*vo.User, error) {
	e, err := s.repository.Get(context.TODO(), userID)
	if err != nil {
		return nil, response.BusinessErr(errcode.UserNotFoundError, "")
	}
	result := vo.NewUser(e)
	return &result, nil
}

func (s User) PagingUsers(page, size int) ([]vo.User, int64, error) {
	es, total, err := s.repository.Paging(context.TODO(), page, size)
	if err != nil {
		return nil, 0, err
	}
	result := make([]vo.User, len(es))
	for i, e := range es {
		result[i] = vo.NewUser(e)
	}
	return result, total, nil
}

func (s User) DeleteUserByID(userID uint) error {
	cmd, err := s.factory.NewUserDeleteCmd(userID)
	if err != nil {
		return err
	}
	return cmd.Run()
}

func (s User) UpdateProfileByUserID(userID uint, req request.Profile) (*vo.User, error) {
	ctx := context.TODO()
	e, err := s.repository.Get(ctx, userID)
	if err != nil {
		return nil, response.BusinessErr(errcode.UserNotFoundError, "")
	}
	updates := map[string]interface{}{}
	for k, v := range req {
		updates[k] = v
	}
	if err := s.repository.Updates(ctx, &e, updates); err != nil {
		return nil, err
	}
	result := vo.NewUser(e)
	return &result, nil
}

func (s User) UpdatePassByUserID(userID uint, req request.UserPass) error {
	ctx := context.TODO()
	e, err := s.repository.Get(ctx, userID)
	if err != nil {
		return response.BusinessErr(errcode.UserNotFoundError, "")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(e.Password), []byte(req.Old)); err != nil {
		return response.BusinessErr(errcode.InvalidOldPasswordError, "")
	}
	newPwd, err := bcrypt.GenerateFromPassword([]byte(req.New), 0)
	if err != nil {
		return err
	}
	e.Password = string(newPwd)
	return s.repository.Save(ctx, &e)
}

func (s User) FindUsers(filters request.Filters) ([]vo.User, error) {
	return nil, nil
}
