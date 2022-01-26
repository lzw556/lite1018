package initialize

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"gorm.io/gorm"
)

func initPermissions(db *gorm.DB) error {
	permissions := []po.Permission{
		{
			Path:        "projects",
			Method:      "POST",
			Description: "添加项目",
			Group:       "项目模块",
		},
		{
			Path:        "projects/:id",
			Method:      "PUT",
			Description: "编辑项目",
			Group:       "项目模块",
		},
		{
			Path:        "projects",
			Method:      "GET",
			Description: "查看项目列表",
			Group:       "项目模块",
		},
		{
			Path:        "projects/:id",
			Method:      "GET",
			Description: "查看项目详情",
			Group:       "项目模块",
		},
		{
			Path:        "projects/:id",
			Method:      "DELETE",
			Description: "删除项目",
			Group:       "项目模块",
		},
		{
			Path:        "assets/:id",
			Method:      "GET",
			Description: "查看单个资产",
			Group:       "资产模块",
		},
		{
			Path:        "assets",
			Method:      "GET",
			Description: "查看资产列表",
			Group:       "资产模块",
		},
		{
			Path:        "assets",
			Method:      "POST",
			Description: "添加资产",
			Group:       "资产模块",
		},
		{
			Path:        "assets/:id",
			Method:      "PUT",
			Description: "编辑资产信息",
			Group:       "资产模块",
		},
		{
			Path:        "assets/:id",
			Method:      "DELETE",
			Description: "删除资产",
			Group:       "资产模块",
		},
		{
			Path:        "measurements",
			Method:      "POST",
			Description: "添加监测点",
			Group:       "监测点模块",
		},
		{
			Path:        "measurements/:id",
			Method:      "PUT",
			Description: "编辑监测点",
			Group:       "监测点模块",
		},
		{
			Path:        "measurements",
			Method:      "GET",
			Description: "查看监测点列表",
			Group:       "监测点模块",
		},
		{
			Path:        "measurements/:id",
			Method:      "GET",
			Description: "查看单个监测点",
			Group:       "监测点模块",
		},
		{
			Path:        "measurements/:id/*",
			Method:      "GET",
			Description: "查看监测点详情",
			Group:       "监测点模块",
		},
		{
			Path:        "measurements/fields",
			Method:      "GET",
			Description: "查看监测点属性",
			Group:       "监测点模块",
		},
		{
			Path:        "measurements/:id/settings",
			Method:      "PATCH",
			Description: "编辑监测点配置",
			Group:       "监测点模块",
		},
		{
			Path:        "measurements/:id/devices",
			Method:      "PATCH",
			Description: "监测点绑定设备",
			Group:       "监测点模块",
		},
		{
			Path:        "measurements/:id",
			Method:      "DELETE",
			Description: "删除监测点",
			Group:       "监测点模块",
		},
		{
			Path:        "measurements/:id/data",
			Method:      "DELETE",
			Description: "删除监测点数据",
			Group:       "监测点模块",
		},
		{
			Path:        "devices/:id",
			Method:      "GET",
			Description: "查看单个设备",
			Group:       "设备模块",
		},
		{
			Path:        "devices/:id",
			Method:      "PUT",
			Description: "编辑设备信息",
			Group:       "设备模块",
		},
		{
			Path:        "devices/:id",
			Method:      "DELETE",
			Description: "删除设备",
			Group:       "设备模块",
		},
		{
			Path:        "devices",
			Method:      "POST",
			Description: "添加设备",
			Group:       "设备模块",
		},
		{
			Path:        "devices",
			Method:      "GET",
			Description: "查看设备列表",
			Group:       "设备模块",
		},
		{
			Path:        "devices/:id/children",
			Method:      "GET",
			Description: "查看子设备",
			Group:       "设备模块",
		},
		{
			Path:        "devices/:id/settings",
			Method:      "GET",
			Description: "查看设备配置信息",
			Group:       "设备模块",
		},
		{
			Path:        "devices/:id/settings",
			Method:      "PATCH",
			Description: "编辑设备配置",
			Group:       "设备模块",
		},
		{
			Path:        "devices/:id",
			Method:      "DELETE",
			Description: "删除设备",
			Group:       "设备模块",
		},
		{
			Path:        "devices/:id/upgrade",
			Method:      "POST",
			Description: "设备升级",
			Group:       "设备模块",
		},
		{
			Path:        "devices/:id/commands/:cmd",
			Method:      "POST",
			Description: "设备命令",
			Group:       "设备模块",
		},
		{
			Path:        "devices/:id/firmwares",
			Method:      "GET",
			Description: "查看设备固件列表",
			Group:       "设备模块",
		},
		{
			Path:        "firmwares",
			Method:      "GET",
			Description: "查看固件列表",
			Group:       "设备模块",
		},
		{
			Path:        "firmwares",
			Method:      "POST",
			Description: "固件上传",
			Group:       "设备模块",
		},
		{
			Path:        "firmwares/:id",
			Method:      "DELETE",
			Description: "删除固件",
			Group:       "设备模块",
		},
		{
			Path:        "devices/:id/data",
			Method:      "GET",
			Description: "查看设备数据",
			Group:       "数据模块",
		},
		{
			Path:        "devices/:id/download/data",
			Method:      "GET",
			Description: "下载设备数据",
			Group:       "数据模块",
		},
		{
			Path:        "devices/:id/data",
			Method:      "DELETE",
			Description: "删除设备数据",
			Group:       "数据模块",
		},
		{
			Path:        "alarmRecords",
			Method:      "GET",
			Description: "查看报警记录列表",
			Group:       "报警模块",
		},
		{
			Path:        "alarmRecords/:id",
			Method:      "GET",
			Description: "查看单个报警记录",
			Group:       "报警模块",
		},
		{
			Path:        "alarmRecords/:id/acknowledge",
			Method:      "PATCH",
			Description: "报警处理",
			Group:       "报警模块",
		},
		{
			Path:        "alarmRecords/:id",
			Method:      "DELETE",
			Description: "删除报警记录",
			Group:       "报警模块",
		},
		{
			Path:        "alarms",
			Method:      "POST",
			Description: "添加报警规则",
			Group:       "报警模块",
		},
		{
			Path:        "alarms/:id",
			Method:      "PUT",
			Description: "编辑报警规则",
			Group:       "报警模块",
		},
		{
			Path:        "alarms",
			Method:      "GET",
			Description: "查看报警规则列表",
			Group:       "报警模块",
		},
		{
			Path:        "alarms/:id",
			Method:      "GET",
			Description: "查看单个报警规则",
			Group:       "报警模块",
		},
		{
			Path:        "alarms/:id",
			Method:      "DELETE",
			Description: "删除报警规则",
			Group:       "报警模块",
		},
		{
			Path:        "alarmTemplates",
			Method:      "POST",
			Description: "添加报警规则模板",
			Group:       "报警模块",
		},
		{
			Path:        "alarmTemplates",
			Method:      "GET",
			Description: "查看报警规则模板列表",
			Group:       "报警模块",
		},
		{
			Path:        "alarmTemplates/:id",
			Method:      "GET",
			Description: "查看单个报警规则模板",
			Group:       "报警模块",
		},
		{
			Path:        "alarmTemplates/:id",
			Method:      "PUT",
			Description: "编辑报警规则模板",
			Group:       "报警模块",
		},
		{
			Path:        "alarmTemplates/:id",
			Method:      "DELETE",
			Description: "删除报警规则模板",
			Group:       "报警模块",
		},
		{
			Path:        "users",
			Method:      "POST",
			Description: "添加用户",
			Group:       "用户模块",
		},
		{
			Path:        "users/:id",
			Method:      "PUT",
			Description: "编辑用户",
			Group:       "用户模块",
		},
		{
			Path:        "users/:id",
			Method:      "DELETE",
			Description: "删除用户",
			Group:       "用户模块",
		},
		{
			Path:        "users/:id",
			Method:      "GET",
			Description: "查看单个用户信息",
			Group:       "用户模块",
		},
		{
			Path:        "users",
			Method:      "GET",
			Description: "查看用户列表",
			Group:       "用户模块",
		},
		{
			Path:        "networks",
			Method:      "POST",
			Description: "添加网络",
			Group:       "网络模块",
		},
		{
			Path:        "networks/import",
			Method:      "POST",
			Description: "导入网络",
			Group:       "网络模块",
		},
		{
			Path:        "networks",
			Method:      "GET",
			Description: "查看网络列表",
			Group:       "网络模块",
		},
		{
			Path:        "networks/:id",
			Method:      "GET",
			Description: "查看单个网络信息",
			Group:       "网络模块",
		},
		{
			Path:        "networks/:id/export",
			Method:      "GET",
			Description: "导出网络",
			Group:       "网络模块",
		},
		{
			Path:        "networks/:id",
			Method:      "PUT",
			Description: "编辑网络信息",
			Group:       "网络模块",
		},
		{
			Path:        "networks/:id/sync",
			Method:      "PUT",
			Description: "同步网络",
			Group:       "网络模块",
		},
		{
			Path:        "networks/:id/devices",
			Method:      "PATCH",
			Description: "接入设备",
			Group:       "网络模块",
		},
		{
			Path:        "networks/:id/devices",
			Method:      "DELETE",
			Description: "移除设备",
			Group:       "网络模块",
		},
		{
			Path:        "networks/:id",
			Method:      "DELETE",
			Description: "删除网络",
			Group:       "网络模块",
		},
		{
			Path:        "roles",
			Method:      "POST",
			Description: "添加角色",
			Group:       "系统模块",
		},
		{
			Path:        "roles/:id",
			Method:      "PUT",
			Description: "编辑角色信息",
			Group:       "系统模块",
		},
		{
			Path:        "roles",
			Method:      "GET",
			Description: "查看角色列表",
			Group:       "系统模块",
		},
		{
			Path:        "roles/:id",
			Method:      "GET",
			Description: "查看单个角色",
			Group:       "系统模块",
		},
		{
			Path:        "roles/:id/menus",
			Method:      "PATCH",
			Description: "角色分配菜单",
			Group:       "系统模块",
		},
		{
			Path:        "roles/:id/permissions",
			Method:      "PATCH",
			Description: "角色分配权限",
			Group:       "系统模块",
		},
		{
			Path:        "roles/:id",
			Method:      "DELETE",
			Description: "删除角色",
			Group:       "系统模块",
		},
	}
	for _, permission := range permissions {
		err := db.FirstOrCreate(&permission, map[string]interface{}{"path": permission.Path, "method": permission.Method}).Error
		if err != nil {
			return err
		}
	}
	return nil
}
