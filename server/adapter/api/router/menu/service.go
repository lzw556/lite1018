package menu

import "github.com/thetasensors/theta-cloud-lite/server/domain/vo"

type Service interface {
	GetMenusByUserID(userID uint) (vo.Menus, error)
	GetMenusTree() (vo.Menus, error)
}
