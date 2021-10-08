package user

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type Service interface {
	Login(req request.Login) (*vo.AccessToken, error)
	CreateUser(req request.User) error
	UpdateUser(userID uint, req request.User) (*vo.User, error)

	GetUser(userID uint) (*vo.User, error)
	FindUsersByPaginate(page, size int) ([]vo.User, int64, error)

	RemoveUser(userID uint) error
}
