package user

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type Service interface {
	Login(req request.Login) (*vo.AccessToken, error)
	CreateUser(req request.User) error
	UpdateUserByID(id uint, req request.User) (*vo.User, error)
	UpdateProfileByUserID(userID uint, req request.Profile) (*vo.User, error)
	UpdatePassByUserID(userID uint, req request.UserPass) error

	GetUserByID(id uint) (*vo.User, error)
	FindUsersByPaginate(page, size int) ([]vo.User, int64, error)

	DeleteUserByID(id uint) error
}
