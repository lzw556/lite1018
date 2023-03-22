import { Login, NotFound, ServerError, Unauthorized } from '../views';
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
    title: 'CREATE_DEVICE',
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
    title: 'DEVICE_DETAIL',
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
    title: 'NETWORK_DETAIL',
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
    title: 'CREATE_ALARM_RULE',
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
    title: 'EDIT_ALARM_RULE',
    view: 'AlarmRuleGroupEdit',
    icon: '',
    hidden: true,
    isAuth: true,
    children: []
  }
];

export { AppRoutes, SecondaryRoutes };
