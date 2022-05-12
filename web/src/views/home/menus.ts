export const menus_fake = [
  {
    children: [],
    hidden: false,
    icon: 'icon-device-monitor',
    id: 11000,
    isAuth: true,
    name: 'project-overview',
    path: '/project-overview',
    title: '总览',
    view: 'ProjectOverview'
  },
  {
    children: [
      {
        children: [],
        hidden: false,
        icon: '',
        id: 12000,
        isAuth: true,
        name: 'asset-management',
        path: '/asset-management',
        title: '风机列表',
        view: 'AssetManagement'
      },
      {
        children: [],
        hidden: false,
        icon: '',
        id: 12000,
        isAuth: true,
        name: 'measruement-management',
        path: '/measurement-management',
        title: '监测点列表',
        view: 'MeasurementManagement'
      }
    ],
    hidden: false,
    icon: 'icon-asset-management',
    id: 12000,
    isAuth: true,
    name: '',
    path: '',
    title: '资产管理',
    view: ''
  }
];
