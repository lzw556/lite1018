package user

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type Service interface {
	Login(req request.Login) (*vo.AccessToken, error)
	CreateUser(req request.User) error
	UpdateUserByID(id uint, req request.UpdateUser) (*vo.User, error)
	UpdateProfileByUserID(userID uint, req request.Profile) (*vo.User, error)
	UpdatePassByUserID(userID uint, req request.UserPass) error

	GetUserByID(id uint) (*vo.User, error)
	PagingUsers(page, size int) ([]vo.User, int64, error)
	FindUsers(filters request.Filters) ([]vo.User, error)

	DeleteUserByID(id uint) error
}
