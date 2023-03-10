import { lazy } from 'react';

export const Login = lazy(() => import('./login'));
export const Device = lazy(() => import('./device'));
export const DeviceDetail = lazy(() => import('./device/detail'));
export const AddDevice = lazy(() => import('./device/add'));
export const Network = lazy(() => import('./network'));
export const NetworkDetail = lazy(() => import('./network/detail'));
export const ImportNetwork = lazy(() => import('./network/import'));
export const AlarmRecord = lazy(() => import('./alarm/record'));
export const Firmware = lazy(() => import('./firmware'));
export const User = lazy(() => import('./user'));
export const Me = lazy(() => import('./me'));
export const Role = lazy(() => import('./system/role'));
export const System = lazy(() => import('./system'));
export const Project = lazy(() => import('./project'));
export const ProjectOverview = lazy(() => import('./home'));
export const AssetManagement = lazy(() => import('./home/assetList'));
export const WindTurbineOverview = lazy(
  () => import('./home/summary/windTurbine/windTurbineOverview')
);
export const FlangeOverview = lazy(() => import('./home/summary/flange/flangeOverview'));
export const MeasurementManagement = lazy(() => import('./home/measurementList'));
export const BoltOverview = lazy(() => import('./home/summary/measurement/boltOverview'));
export const AlarmRule = lazy(() => import('./home/summary/measurement/alarm'));
export const AlarmRuleGroupCreation = lazy(
  () => import('./home/summary/measurement/alarm/alarmRuleGroupCreation')
);
export const AlarmRuleGroupEdit = lazy(
  () => import('./home/summary/measurement/alarm/alarmRuleGroupEdit')
);
export const AssetOverview = lazy(() => import('./home/summary/base/assetOverview'));

export const Unauthorized = lazy(() => import('./403'));
export const NotFound = lazy(() => import('./404'));
export const ServerError = lazy(() => import('./500'));
