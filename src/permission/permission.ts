import { Enforcer, MemoryAdapter, newEnforcer, newModel } from 'casbin.js';
import React from 'react';
import { getPermission } from '../utils/session';

export type PermissionType = {
  path: string;
  method: string;
};

export const Permission = {
  ProjectAdd: { path: 'projects', method: 'POST' },
  ProjectList: { path: 'projects', method: 'GET' },
  ProjectAllocUser: { path: 'projects/:id/users', method: 'PATCH' },
  ProjectAllocUserGet: { path: 'projects/:id/users', method: 'GET' },
  ProjectEdit: { path: 'projects/:id', method: 'PUT' },
  ProjectDelete: { path: 'projects/:id', method: 'DELETE' },
  DeviceCommand: { path: 'devices/:id/commands/:cmd', method: 'POST' },
  DeviceUpgrade: { path: 'devices/:id/upgrade', method: 'POST' },
  DeviceAdd: { path: 'devices', method: 'POST' },
  DeviceReplace: { path: 'devices/:id/mac/:mac', method: 'PATCH' },
  DeviceEdit: { path: 'devices/:id', method: 'PUT' },
  DeviceSettingsGet: { path: 'devices/:id/settings', method: 'GET' },
  DeviceSettingsEdit: { path: 'devices/:id/settings', method: 'PATCH' },
  DeviceDelete: { path: 'devices/:id', method: 'DELETE' },
  DeviceDetail: { path: 'devices/:id', method: 'GET' },
  DeviceDataDelete: { path: 'devices/:id/data', method: 'DELETE' },
  DeviceDataDownload: { path: 'devices/:id/download/data', method: 'GET' },
  DeviceRawDataDownload: { path: 'devices/:id/download/data/:timestamp', method: 'GET' },
  DeviceFirmwares: { path: 'devices/:id/firmwares', method: 'GET' },
  DeviceData: { path: 'devices/:id/data', method: 'GET' },
  DeviceEventList: { path: 'devices/:id/events', method: 'GET' },
  DeviceEventDelete: { path: 'devices/:id/events', method: 'DELETE' },
  DeviceRuntimeDataGet: { path: 'devices/:id/runtime', method: 'GET' },
  NetworkSettingEdit: { path: 'networks/setting', method: 'PUT' },
  NetworkRemoveDevices: { path: 'networks/:id/devices', method: 'DELETE' },
  NetworkAddDevices: { path: 'networks/:id/devices', method: 'PATCH' },
  NetworkAdd: { path: 'networks', method: 'POST' },
  NetworkExport: { path: 'networks/:id/export', method: 'GET' },
  NetworkEdit: { path: 'networks/:id', method: 'PUT' },
  NetworkDelete: { path: 'networks/:id', method: 'DELETE' },
  NetworkDetail: { path: 'networks/:id', method: 'GET' },
  NetworkSync: { path: 'networks/:id/sync', method: 'PUT' },
  NetworkProvision: { path: 'networks/:id/provision', method: 'PUT' },
  AlarmRuleAdd: { path: 'alarmRules', method: 'POST' },
  AlarmRuleEdit: { path: 'alarmRules/:id', method: 'PUT' },
  AlarmRuleStatusEdit: { path: 'alarmRules/:id/status/:status', method: 'PUT' },
  AlarmSourceAdd: { path: 'alarmRules/:id/sources', method: 'POST' },
  AlarmRuleDelete: { path: 'alarmRules/:id', method: 'DELETE' },
  AlarmRuleTemplateAdd: { path: 'alarmRuleTemplates', method: 'POST' },
  AlarmRuleTemplateEdit: { path: 'alarmRuleTemplates/:id', method: 'PUT' },
  AlarmRuleTemplateDelete: { path: 'alarmRuleTemplates/:id', method: 'DELETE' },
  AlarmRecordDelete: { path: 'alarmRecords/:id', method: 'DELETE' },
  AlarmRecordAcknowledge: { path: 'alarmRecords/:id/acknowledge', method: 'POST' },
  AlarmRecordAcknowledgeGet: { path: 'alarmRecords/:id/acknowledge', method: 'GET' },
  AlarmRecordGet: { path: 'alarmRecords/:id', method: 'GET' },
  UserAdd: { path: 'users', method: 'POST' },
  UserEdit: { path: 'users/:id', method: 'PUT' },
  UserDelete: { path: 'users/:id', method: 'DELETE' },
  FirmwareAdd: { path: 'firmwares', method: 'POST' },
  FirmwareDelete: { path: 'firmwares/:id', method: 'DELETE' },
  RoleGet: { path: 'roles/:id', method: 'GET' },
  RoleList: { path: 'roles', method: 'GET' },
  RoleAdd: { path: 'roles', method: 'POST' },
  RoleEdit: { path: 'roles/:id', method: 'PUT' },
  RoleDelete: { path: 'roles/:id', method: 'DELETE' },
  RoleAllocMenus: { path: 'roles/:id/menus', method: 'PATCH' },
  RoleAllocPermissions: { path: 'roles/:id/permissions', method: 'PATCH' },
  MenusTree: { path: 'menus/tree', method: 'GET' },
  PermissionsWithGroup: { path: 'permissions/withGroup', method: 'GET' },
  AssetAdd: { path: 'assets', method: 'POST' },
  AssetList: { path: 'assets', method: 'GET' },
  AssetDetail: { path: 'assets/:id', method: 'GET' },
  AssetEdit: { path: 'assets/:id', method: 'PUT' },
  AssetDelete: { path: 'assets/:id', method: 'DELETE' },
  AssetExport: { path: 'my/projects/:id/exportFile', method: 'GET' },
  AssetImport: { path: 'my/projects/:id/import', method: 'POST' },
  AssetDataDownload: { path: 'assets/:id/download/data', method: 'GET' },
  MeasurementAdd: { path: 'monitoringPoints', method: 'POST' },
  MeasurementList: { path: 'monitoringPoints', method: 'GET' },
  MeasurementDetail: { path: 'monitoringPoints/:id', method: 'GET' },
  MeasurementEdit: { path: 'monitoringPoints/:id', method: 'PUT' },
  MeasurementDelete: { path: 'monitoringPoints/:id', method: 'DELETE' },
  MeasurementDataDownload: { path: 'monitoringPoints/:id/download/data', method: 'GET' },
  MeasurementDataDelete: { path: 'monitoringPoints/:id/data', method: 'DELETE' },
  AlarmRuleGroupAdd: { path: 'alarmRuleGroups', method: 'POST' },
  AlarmRuleGroupEdit: { path: 'alarmRuleGroups/:id', method: 'PUT' },
  AlarmRuleGroupDelete: { path: 'alarmRuleGroups/:id', method: 'DELETE' },
  AlarmRuleGroupBind: { path: 'alarmRuleGroups/:id/bindings', method: 'PUT' },
  AlarmRuleGroupExport: { path: 'alarmRuleGroups/exportFile', method: 'GET' },
  AlarmRuleGroupImport: { path: 'alarmRuleGroups/import', method: 'POST' }
};

const usePermission = () => {
  const [enforcer, setEnforcer] = React.useState<Enforcer | null>(null);
  const [subject, setSubject] = React.useState<null>(null);

  React.useEffect(() => {
    const model = newModel(`
  [request_definition]
  r = sub, obj, act

  [policy_definition]
  p = sub, obj, act

  [role_definition]
  g = _, _

  [policy_effect]
  e = some(where (p.eft == allow))

  [matchers]
  m = g(r.sub, p.sub) && keyMatch2(r.obj, p.obj) && r.act == p.act || r.sub == "admin"`);
    const data = getPermission();
    if (data && data.subject.length > 0) {
      const adapter = new MemoryAdapter(data.rules);
      newEnforcer(model, adapter).then((value) => {
        setEnforcer(value);
        setSubject(data.subject);
      });
    }
  }, []);

  return {
    hasPermission: (value: PermissionType) => {
      return !!(enforcer && enforcer.enforceSync(subject, value.path, value.method));
    },
    hasPermissions: (first: PermissionType, ...seconds: PermissionType[]) => {
      if (enforcer) {
        const permissions = [first, ...seconds];
        return permissions.every((value) =>
          enforcer?.enforceSync(subject, value.path, value.method)
        );
      }
      return false;
    }
  };
};

export default usePermission;
