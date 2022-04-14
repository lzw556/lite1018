package initialize

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"gorm.io/gorm"
)

func initRoles(db *gorm.DB) error {
	roles := []entity.Role{
		{
			ID:          1,
			Name:        "平台管理员",
			Description: "平台管理员角色, 拥有平台的所有权限",
		},
		{
			ID:          2,
			Name:        "项目管理员",
			Description: "项目管理员角色, 拥有项目的所有权限, 但不能创建项目",
		},
		{
			ID:          3,
			Name:        "操作员",
			Description: "操作员角色, 拥有项目的部分权限",
		},
		{
			ID:          4,
			Name:        "访客",
			Description: "访客角色, 只能访问项目",
		},
	}
	for _, role := range roles {
		err := db.FirstOrCreate(&role, map[string]interface{}{"name": role.Name}).Error
		if err != nil {
			return err
		}
	}
	return nil
}
