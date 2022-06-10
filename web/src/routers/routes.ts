import {
  AddAlarmRule,
  AddAlarmRuleTemplate,
  DeviceDetail,
  Login,
  NotFound,
  ServerError,
  Unauthorized
} from '../views';
import { Menu } from '../types/menu';

const AppRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    isAuth: false
  },
  {
    path: '/403',
    name: '403',
    component: Unauthorized,
    isAuth: false
  },
  {
    path: '/404',
    name: '404',
    component: NotFound,
    isAuth: false
  },
  {
    path: '/500',
    name: '500',
    component: ServerError,
    isAuth: false
  }
];

const SecondaryRoutes: Menu[] = [
  {
    id: 100,
    name: 'addDevice',
    path: '/device-management',
    title: '添加设备',
    view: 'AddDevice',
    icon: '',
    hidden: true,
    isAuth: true,
    children: []
  },
  {
    id: 100,
    name: 'deviceDetail',
    path: '/device-management',
    title: '设备详情',
    view: 'DeviceDetail',
    icon: '',
    hidden: true,
    isAuth: true,
    children: []
  },
  {
    id: 101,
    name: 'addAlarmRule',
    path: '/alarm-management',
    title: '添加规则',
    view: 'AddAlarmRule',
    icon: '',
    hidden: true,
    isAuth: true,
    children: []
  },
  {
    id: 102,
    name: 'addAlarmRuleTemplate',
    path: '/alarm-management',
    title: '添加规则模板',
    view: 'AddAlarmRuleTemplate',
    icon: '',
    hidden: true,
    isAuth: true,
    children: []
  },
  {
    id: 103,
    name: 'editAlarmRuleTemplate',
    path: '/alarm-management',
    title: '编辑规则模板',
    view: 'EditAlarmRuleTemplate',
    icon: '',
    hidden: true,
    isAuth: true,
    children: []
  },
  {
    id: 104,
    name: 'networkDetail',
    path: '/network-management',
    title: '网络详情',
    view: 'NetworkDetail',
    icon: '',
    hidden: true,
    isAuth: true,
    children: []
  },
  {
    id: 105,
    name: 'measurementDetail',
    path: '/asset-management',
    title: '监测点详情',
    view: 'MeasurementDetail',
    icon: '',
    hidden: true,
    isAuth: true,
    children: []
  },
  {
    id: 107,
    name: 'deviceDetail',
    path: '/device-monitor',
    title: '设备详情',
    view: 'DeviceDetail',
    icon: '',
    hidden: true,
    isAuth: true,
    children: []
  },
  {
    id: 108,
    name: 'windturbine',
    path: '/project-overview',
    title: '总览',
    view: 'WindTurbineOverview',
    icon: '',
    hidden: false,
    isAuth: true,
    children: []
  },
  {
    id: 109,
    name: 'windturbine',
    path: '/asset-management',
    title: '资产列表',
    view: 'WindTurbineOverview',
    icon: '',
    hidden: false,
    isAuth: true,
    children: []
  },
  {
    id: 110,
    name: 'windturbine',
    path: '/measurement-management',
    title: '监测点列表',
    view: 'WindTurbineOverview',
    icon: '',
    hidden: false,
    isAuth: true,
    children: []
  },
  {
    id: 111,
    name: 'flange',
    path: '/project-overview',
    title: '总览',
    view: 'FlangeOverview',
    icon: '',
    hidden: false,
    isAuth: true,
    children: []
  },
  {
    id: 112,
    name: 'flange',
    path: '/asset-management',
    title: '资产列表',
    view: 'FlangeOverview',
    icon: '',
    hidden: false,
    isAuth: true,
    children: []
  },
  {
    id: 113,
    name: 'flange',
    path: '/measurement-management',
    title: '监测点列表',
    view: 'FlangeOverview',
    icon: '',
    hidden: false,
    isAuth: true,
    children: []
  },
  {
    id: 114,
    name: 'bolt',
    path: '/project-overview',
    title: '总览',
    view: 'BoltOverview',
    icon: '',
    hidden: false,
    isAuth: true,
    children: []
  },
  {
    id: 115,
    name: 'bolt',
    path: '/asset-management',
    title: '资产列表',
    view: 'BoltOverview',
    icon: '',
    hidden: false,
    isAuth: true,
    children: []
  },
  {
    id: 116,
    name: 'bolt',
    path: '/measurement-management',
    title: '监测点列表',
    view: 'BoltOverview',
    icon: '',
    hidden: false,
    isAuth: true,
    children: []
  },
  {
    id: 111,
    name: 'addAlarmRuleGroup',
    path: '/alarm-management',
    title: '添加规则组',
    view: 'AlarmRuleGroupCreation',
    icon: '',
    hidden: true,
    isAuth: true,
    children: []
  }
];

export { AppRoutes, SecondaryRoutes };
