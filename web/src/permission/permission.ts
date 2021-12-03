import {GetCasbinRequest} from "../apis/role";
import {Enforcer, MemoryAdapter, newEnforcer, newModel} from "casbin.js";

export type PermissionType = {
    path: string;
    method: string;
}

export const Permission = {
    DeviceCommand: {path: 'devices/:id/commands/:cmd', method: 'POST'},
    DeviceUpgrade: {path: "devices/:id/upgrade", method: "POST"},
    DeviceAdd: {path: "devices", method: "POST"},
    DeviceReplace: {path: "devices/:id/mac/:mac", method: "PATCH"},
    DeviceEdit: {path: "devices/:id", method: "PUT"},
    DeviceSettingsEdit: {path: "devices/:id/settings", method: "PATCH"},
    DeviceDelete: {path: "devices/:id", method: "DELETE"},
    DeviceDetail: {path: "devices/:id", method: "GET"},
    DeviceDataDelete: {path: "devices/:id/data", method: "DELETE"},
    DeviceDataDownload: {path: "devices/:id/download/data", method: "GET"},
    DeviceData: {path: "devices/:id/data", method: "GET"},
    NetworkSettingEdit: {path: "networks/setting", method: "PUT"},
    NetworkRemoveDevices: {path: "networks/:id/devices", method: "DELETE"},
    NetworkAccessDevices: {path: "networks/:id/devices", method: "PATCH"},
    NetworkExport: {path: "networks/:id/export", method: "GET"},
    NetworkEdit: {path: "networks/:id", method: "PUT"},
    NetworkDelete: {path: "networks/:id", method: "DELETE"},
    AlarmRuleAdd: {path: "alarmRules", method: "POST"},
    AlarmRuleEdit: {path: "alarmRules/:id", method: "PUT"},
    AlarmRuleDelete: {path: "alarmRules/:id", method: "DELETE"},
    AlarmRuleTemplateAdd: {path: "alarmRuleTemplates", method: "POST"},
    AlarmRuleTemplateEdit: {path: "alarmRuleTemplates/:id", method: "PUT"},
    AlarmRuleTemplateDelete: {path: "alarmRuleTemplates/:id", method: "DELETE"},
    AssetAdd: {path: "assets", method: "POST"},
    AssetEdit: {path: "assets/:id", method: "PUT"},
    AssetDelete: {path: "assets/:id", method: "DELETE"},
    UserAdd: {path: "users", method: "POST"},
    UserEdit: {path: "users/:id", method: "PUT"},
    UserDelete: {path: "users/:id", method: "DELETE"},
    FirmwareAdd: {path: "firmwares", method: "POST"},
    FirmwareDelete: {path: "firmwares/:id", method: "DELETE"},
    RoleAdd: {path: "roles", method: "POST"},
    RoleEdit: {path: "roles/:id", method: "PUT"},
    RoleDelete: {path: "roles/:id", method: "DELETE"},
    RoleAllocMenus: {path: "roles/:id/menus", method: "PATCH"},
    RoleAllocPermissions: {path: "roles/:id/permissions", method: "PATCH"},
}

let enforcer: Enforcer | null = null
let subject: null = null

GetCasbinRequest().then(data => {
    const model = newModel(data.model);
    const adapter = new MemoryAdapter(data.rules);
    newEnforcer(model, adapter).then(value => {
        enforcer = value
        subject = data.subject
    });
})

const userPermission = () => {
    return {
        hasPermission: (value: PermissionType) => {
            if (enforcer === null) {
                return false
            }
            return enforcer.enforceSync(subject, value.path, value.method)
        }
    }
}

export default userPermission