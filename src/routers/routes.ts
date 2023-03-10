import { DeviceDetail, Login, NotFound, ServerError, Unauthorized } from '../views';
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
    id: 111,
    name: 'addAlarmRuleGroup',
    path: '/alarm-management',
    title: '添加规则',
    view: 'AlarmRuleGroupCreation',
    icon: '',
    hidden: true,
    isAuth: true,
    children: []
  },
  {
    id: 112,
    name: 'editAlarmRuleGroup',
    path: '/alarm-management',
    title: '编辑规则',
    view: 'AlarmRuleGroupEdit',
    icon: '',
    hidden: true,
    isAuth: true,
    children: []
  }
];

export { AppRoutes, SecondaryRoutes };
