package role

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type Service interface {
	CreateRole(req request.Role) error
	UpdateRoleByID(id uint, req request.Role) error
	GetRolesByPaginate(page, size int) ([]vo.Role, int64, error)

	DeleteRoleByID(id uint) error

	GetRoleByID(id uint) (*vo.Role, error)
	GetCasbinByUserID(id uint) (*vo.Casbin, error)
	AllocMenusByRoleID(id uint, req request.AllocMenus) error
}
