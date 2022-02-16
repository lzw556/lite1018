package initialize

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"gorm.io/gorm"
)

func initMenus(db *gorm.DB) error {
	menus := []entity.Menu{
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
		//{
		//	ID:       2000,
		//	Title:    "资产管理",
		//	Name:     "asset-management",
		//	ParentID: 0,
		//	Icon:     "icon-asset-management",
		//	IsAuth:   true,
		//	Hidden:   false,
		//	Sort:     0,
		//},
		//{
		//	ID:       2001,
		//	Title:    "资产监控",
		//	Name:     "assetMonitor",
		//	ParentID: 2000,
		//	View:     "AssetMonitor",
		//	Path:     "/asset-management",
		//},
		//{
		//	ID:       2002,
		//	Title:    "资产列表",
		//	Name:     "assets",
		//	ParentID: 2000,
		//	View:     "Asset",
		//	Path:     "/asset-management",
		//},
		//{
		//	ID:       2003,
		//	Title:    "添加监测点",
		//	Name:     "addMeasurement",
		//	ParentID: 2000,
		//	View:     "AddMeasurement",
		//	Path:     "/asset-management",
		//},
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
		},
		{
			ID:       4000,
			Title:    "网络管理",
			Name:     "network-management",
			ParentID: 0,
			Icon:     "icon-network-management",
			IsAuth:   true,
			Hidden:   false,
			Sort:     2,
		},
		{
			ID:       4001,
			Title:    "网络列表",
			Name:     "networks",
			ParentID: 4000,
			Path:     "/network-management",
			View:     "Network",
			IsAuth:   true,
			Hidden:   false,
		},
		{
			ID:       4002,
			Title:    "导入网络",
			Name:     "importNetwork",
			ParentID: 4000,
			Path:     "/network-management",
			View:     "ImportNetwork",
			IsAuth:   true,
			Hidden:   false,
		},
		//{
		//	ID:       5000,
		//	Title:    "报警管理",
		//	Name:     "alarm-management",
		//	ParentID: 0,
		//	Icon:     "icon-alarm-management",
		//	IsAuth:   true,
		//	Hidden:   false,
		//	Sort:     4,
		//},
		//{
		//	ID:       5001,
		//	Title:    "报警列表",
		//	Name:     "alerts",
		//	ParentID: 5000,
		//	Path:     "/alarm-management",
		//	View:     "AlarmRecord",
		//	IsAuth:   true,
		//	Hidden:   false,
		//},
		//{
		//	ID:       5002,
		//	Title:    "报警规则",
		//	Name:     "alarmRules",
		//	ParentID: 5000,
		//	Path:     "/alarm-management",
		//	View:     "AlarmRule",
		//	IsAuth:   true,
		//	Hidden:   false,
		//},
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
