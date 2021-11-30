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
    NetworkSettingEdit: {path: "networks/setting", method: "PUT"},
    NetworkRemoveDevices: {path: "networks/:id/devices", method: "DELETE"},
    NetworkAccessDevices: {path: "networks/:id/devices", method: "PATCH"},
    NetworkExport: {path: "networks/:id/export", method: "GET"},
    NetworkEdit: {path: "networks/:id", method: "PUT"},
    AlarmRuleAdd: {path: "alarmRules", method: "POST"},
    AlarmRuleEdit: {path: "alarmRules/:id", method: "PUT"},
    AlarmRuleDelete: {path: "alarmRules/:id", method: "DELETE"},
    AlarmRuleTemplateAdd: {path: "alarmRuleTemplates", method: "POST"},
    AlarmRuleTemplateEdit: {path: "alarmRuleTemplates/:id", method: "PUT"},
    AlarmRuleTemplateDelete: {path: "alarmRuleTemplates/:id", method: "DELETE"},
}

let enforcer: Enforcer | null = null
let subject: null = null

GetCasbinRequest().then(res => {
    if (res.code === 200) {
        console.log(res.data)
        const model = newModel(res.data.model);
        const adapter = new MemoryAdapter(res.data.rules);
        newEnforcer(model, adapter).then(value => {
            enforcer = value
            subject = res.data.subject
        });
    }
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