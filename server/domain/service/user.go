package service

import (
	"context"
	"errors"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/user"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/jwt"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type User struct {
	repository dependency.UserRepository
}

func NewUser() user.Service {
	return User{
		repository: repository.User{},
	}
}

func (s User) Login(req request.Login) (*vo.AccessToken, error) {
	ctx := context.TODO()
	e, err := s.repository.GetBySpecs(ctx, spec.UsernameSpec(req.Username))
	if err != nil {
		return nil, response.BusinessErr(errcode.UserNotFoundError, err.Error())
	}
	if err := bcrypt.CompareHashAndPassword([]byte(e.Password), []byte(req.Password)); err != nil {
		return nil, response.BusinessErr(errcode.InvalidUsernameOrPasswordError, err.Error())
	}
	token, err := jwt.GenerateToken(e.ID, e.Username)
	if err != nil {
		return nil, response.BusinessErr(errcode.InvalidUsernameOrPasswordError, err.Error())
	}
	result := vo.NewAccessToken(token)
	result.SetUser(e)
	return &result, nil
}

func (s User) CreateUser(req request.User) error {
	ctx := context.TODO()
	e, err := s.repository.GetBySpecs(ctx, spec.UsernameSpec(req.Username))
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return response.BusinessErr(errcode.UserExistsError, "")
	}
	e.Username = req.Username
	e.Password = req.Password
	e.Email = req.Email
	e.Phone = req.Phone
	e.RoleID = req.Role
	return s.repository.Create(ctx, &e)
}

func (s User) UpdateUser(userID uint, req request.User) (*vo.User, error) {
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

func (s User) GetUser(userID uint) (*vo.User, error) {
	e, err := s.repository.Get(context.TODO(), userID)
	if err != nil {
		return nil, response.BusinessErr(errcode.UserNotFoundError, "")
	}
	result := vo.NewUser(e)
	return &result, nil
}

func (s User) FindUsersByPaginate(page, size int) ([]vo.User, int64, error) {
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

func (s User) RemoveUser(userID uint) error {
	ctx := context.TODO()
	e, err := s.repository.Get(ctx, userID)
	if err != nil {
		return response.BusinessErr(errcode.UserNotFoundError, "")
	}
	return s.repository.Delete(ctx, e.ID)
}

func (s User) UpdateProfile(userID uint, req request.Profile) (*vo.User, error) {
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

func (s User) UpdatePass(userID uint, req request.UserPass) error {
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
