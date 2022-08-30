package initialize

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"gorm.io/gorm"
)

func initUsers(db *gorm.DB) error {
	user := entity.User{
		Username: "admin",
		Password: "123456",
	}
	err := db.FirstOrCreate(&user, map[string]interface{}{"id": 1, "username": user.Username}).Error
	if err != nil {
		return err
	}
	return err
}

func initProject(db *gorm.DB) error {
	project := entity.Project{
		Name:        "默认项目",
		Description: "默认项目",
	}
	err := db.FirstOrCreate(&project, map[string]interface{}{"name": "默认项目"}).Error
	if err != nil {
		return err
	}
	return nil
}

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

func initMenus(db *gorm.DB) error {
	menus := []entity.Menu{
		{
			ID:       2000,
			Title:    "总览",
			Name:     "project-overview",
			ParentID: 0,
			Icon:     "icon-device-monitor",
			Path:     "/project-overview",
			View:     "ProjectOverview",
			IsAuth:   true,
			Hidden:   false,
			Sort:     0,
		},
		{
			ID:       2001,
			Title:    "资产管理",
			Name:     "assets-management",
			ParentID: 0,
			Icon:     "icon-asset-management",
			IsAuth:   true,
			Hidden:   false,
			Sort:     0,
		},
		{
			ID:       2002,
			Title:    "资产树",
			Name:     "asset-management",
			ParentID: 2001,
			Icon:     "icon-device-monitor",
			Path:     "/asset-management",
			View:     "AssetManagement",
			IsAuth:   true,
			Hidden:   false,
			Sort:     0,
		},
		{
			ID:       2003,
			Title:    "资产列表",
			Name:     "measurement-management",
			ParentID: 2001,
			Icon:     "icon-device-monitor",
			Path:     "/measurement-management",
			View:     "MeasurementManagement",
			IsAuth:   true,
			Hidden:   false,
			Sort:     0,
		},
		{
			ID:       1000,
			Title:    "系统管理",
			Name:     "system-management",
			ParentID: 0,
			Icon:     "icon-system",
			IsAuth:   true,
			Hidden:   false,
			Sort:     10,
		},
		{
			ID:       1001,
			Title:    "角色管理",
			Name:     "roles",
			View:     "Role",
			Path:     "/system-management",
			ParentID: 1000,
			IsAuth:   true,
			Hidden:   false,
			Sort:     0,
		},
		{
			ID:       1002,
			Title:    "系统状态",
			Name:     "systemInfo",
			View:     "System",
			Path:     "/system-management",
			ParentID: 1000,
			IsAuth:   true,
			Hidden:   false,
			Sort:     2,
		},
		{
			ID:     3000,
			Title:  "设备管理",
			Name:   "device-management",
			Icon:   "icon-device-management",
			IsAuth: true,
			Hidden: false,
			Sort:   1,
		},
		{
			ID:       3001,
			Title:    "设备列表",
			Name:     "devices",
			ParentID: 3000,
			Path:     "/device-management",
			View:     "Device",
			IsAuth:   true,
			Hidden:   false,
			Sort:     1,
		},
		{
			ID:       4001,
			Title:    "网络列表",
			Name:     "networks",
			ParentID: 3000,
			Path:     "/network-management",
			View:     "Network",
			IsAuth:   true,
			Hidden:   false,
			Sort:     2,
		},
		{
			ID:       4002,
			Title:    "导入网络",
			Name:     "importNetwork",
			ParentID: 3000,
			Path:     "/network-management",
			View:     "ImportNetwork",
			IsAuth:   true,
			Hidden:   false,
			Sort:     3,
		},
		{
			ID:       3002,
			Title:    "固件列表",
			Name:     "firmwares",
			ParentID: 3000,
			Path:     "/device-management",
			View:     "Firmware",
			IsAuth:   true,
			Hidden:   false,
			Sort:     4,
		},
		{
			ID:       5000,
			Title:    "报警管理",
			Name:     "alarm-management",
			ParentID: 0,
			Icon:     "icon-alarm-management",
			IsAuth:   true,
			Hidden:   false,
			Sort:     4,
		},
		{
			ID:       5001,
			Title:    "报警记录",
			Name:     "alerts",
			ParentID: 5000,
			Path:     "/alarm-management",
			View:     "AlarmRecord",
			IsAuth:   true,
			Hidden:   false,
		},
		{
			ID:       5002,
			Title:    "报警规则",
			Name:     "alarmRules",
			ParentID: 5000,
			Path:     "/alarm-management",
			View:     "AlarmRule",
			IsAuth:   true,
			Hidden:   false,
		},
		{
			ID:       8000,
			Title:    "项目管理",
			Name:     "projects",
			ParentID: 0,
			Icon:     "icon-project-management",
			Path:     "/project-management",
			View:     "Project",
			IsAuth:   true,
			Hidden:   false,
			Sort:     5,
		},
		{
			ID:       6000,
			Title:    "用户管理",
			Name:     "users",
			ParentID: 0,
			Icon:     "icon-user-management",
			Path:     "/user-management",
			View:     "User",
			IsAuth:   true,
			Hidden:   false,
			Sort:     6,
		},
		{
			ID:       7000,
			Title:    "个人中心",
			Name:     "me",
			ParentID: 0,
			Icon:     "icon-me",
			Path:     "/user-management",
			View:     "Me",
			IsAuth:   true,
			Hidden:   false,
			Sort:     7,
		},
	}
	for _, menu := range menus {
		err := db.FirstOrCreate(&menu, map[string]interface{}{"id": menu.ID}).Error
		if err != nil {
			return err
		}
	}
	return nil
}

func initRoleMenuRelations(db *gorm.DB) error {
	relations := map[uint][]uint{
		1: {2000, 2001, 2002, 2003, 3000, 3001, 3002, 3100, 4000, 4001, 4002, 5000, 5001, 5002, 6000, 7000, 8000},
		2: {2000, 2001, 2002, 2003, 3000, 3001, 3100, 4000, 4001, 4002, 5000, 5001, 5002, 7000},
		3: {2000, 2001, 2002, 2003, 3000, 3001, 3100, 4000, 4001, 4002, 5000, 5001, 5002, 7000},
		4: {2000, 2001, 2002, 2003, 3000, 3001, 3100, 4000, 4001, 5000, 5001, 5002, 7000},
	}

	for roleID, menuIDs := range relations {
		for _, menuID := range menuIDs {
			if err := db.FirstOrCreate(&entity.RoleMenuRelation{
				RoleID: roleID,
				MenuID: menuID,
			}, map[string]interface{}{"role_id": roleID, "menu_id": menuID}).Error; err != nil {
				return err
			}
		}
	}
	return nil
}
