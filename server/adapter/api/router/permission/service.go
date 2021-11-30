package permission

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type Service interface {
	CreatePermission(req request.Permission) error
	UpdatePermission(id uint, req request.Permission) error
	GetPermissionsByPaginate(page, size int) ([]vo.Permission, int64, error)
	GetPermissionsWithGroup() (map[string][]vo.Permission, error)
}
