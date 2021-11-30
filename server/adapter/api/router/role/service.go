package role

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type Service interface {
	CreateRole(req request.Role) error
	UpdateRole(id uint, req request.Role) error
	GetRolesByPaginate(page, size int) ([]vo.Role, int64, error)

	GetRole(id uint) (*vo.Role, error)
	GetCasbinByUserID(id uint) (*vo.Casbin, error)
	AllocMenus(id uint, req request.AllocMenus) error
	AllocPermissions(id uint, req request.AllocPermissions) error
}
