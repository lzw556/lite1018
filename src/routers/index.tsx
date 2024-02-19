import React, { lazy, Suspense } from 'react';
import { HashRouter, RouteObject, useRoutes } from 'react-router-dom';
import {
  Device,
  DeviceDetail,
  Firmware,
  Login,
  Me,
  Network,
  NetworkDetail,
  NotFound,
  Project,
  Role,
  ServerError,
  System,
  Unauthorized,
  User,
  ImportNetwork,
  AlarmRecord,
  AddDevice,
  ReportList,
  Report,
  DeviceWirelessHart,
  DeviceDetailWirelessHart,
  AddDeviceWirelessHart,
  NetworkWirelessHart,
  NetworkDetailWirelessHart,
  ImportNetworkWirelessHart
} from '../views';
import { PrimaryLayout } from '../views/layout/primaryLayout';
import { isLogin } from '../utils/session';
import { ConfigProvider, Spin } from 'antd';
import { FLANGE_PATHNAME } from '../views/flange';
import { MONITORING_POINT_PATHNAME } from '../views/monitoring-point';
import { useLocaleContext } from '../localeProvider';
import intl from 'react-intl-universal';
import en_US from '../locales/en-US.json';
import zh_CN from '../locales/zh-CN.json';
import zhCN from 'antd/es/locale/zh_CN';
import enUS from 'antd/es/locale/en_US';
import dayjs from '../utils/dayjsUtils';
import 'dayjs/locale/zh-cn';
import { AssetsContextProvider, ASSET_PATHNAME, useAppConfigContext } from '../views/asset';
import { TOWER_PATHNAME } from '../views/tower';

const AlarmRuleGroups = lazy(() => import('../views/alarm/alarm-group/index'));
const CreateAlarmRuleGroups = lazy(() => import('../views/alarm/alarm-group/create'));
const UpdateAlarmRuleGroups = lazy(() => import('../views/alarm/alarm-group/update'));

//wind-turbine
const Assets = lazy(() => import('../views/asset/projectOverview'));
const AssetsTreeList = lazy(() => import('../views/asset/tree-list/index'));
const AssetsTableList = lazy(() => import('../views/asset/table-list/index'));
const AssetShow = lazy(() => import('../views/asset/show/index'));
const FlangeShow = lazy(() => import('../views/flange/show/index'));
const TowerShow = lazy(() => import('../views/tower/show/index'));
const MonitoringPointShow = lazy(() => import('../views/monitoring-point/show/index'));

const AppRouter = () => {
  const config = useAppConfigContext();
  const isWirelessHart = config === 'corrosionWirelessHART';
  const [initDone, setInitDone] = React.useState(false);
  const routes: RouteObject[] = [
    { path: '/403', element: <Unauthorized /> },
    { path: '*', element: <NotFound /> },
    { path: '/500', element: <ServerError /> },
    {
      path: '/',
      element: <PrimaryLayout />,
      children: [
        {
          index: true,
          element: (
            <AssetsContextProvider>
              <Assets />
            </AssetsContextProvider>
          )
        },
        {
          path: 'project-overview',
          element: (
            <AssetsContextProvider>
              <Assets />
            </AssetsContextProvider>
          )
        },
        {
          path: `${ASSET_PATHNAME}/:id`,
          element: (
            <AssetsContextProvider>
              <AssetShow />
            </AssetsContextProvider>
          )
        },
        {
          path: `${FLANGE_PATHNAME}/:id`,
          element: (
            <AssetsContextProvider>
              <FlangeShow />
            </AssetsContextProvider>
          )
        },
        {
          path: `${TOWER_PATHNAME}/:id`,
          element: (
            <AssetsContextProvider>
              <TowerShow />
            </AssetsContextProvider>
          )
        },
        {
          path: `${MONITORING_POINT_PATHNAME}/:id`,
          element: (
            <AssetsContextProvider>
              <MonitoringPointShow />
            </AssetsContextProvider>
          )
        },
        {
          path: 'asset-management',
          element: (
            <AssetsContextProvider>
              <AssetsTreeList />
            </AssetsContextProvider>
          )
        },
        {
          path: 'measurement-management',
          element: (
            <AssetsContextProvider>
              <AssetsTableList />
            </AssetsContextProvider>
          )
        },
        { path: 'devices', element: isWirelessHart ? <DeviceWirelessHart /> : <Device /> },
        {
          path: 'devices/:id',
          element: isWirelessHart ? <DeviceDetailWirelessHart /> : <DeviceDetail />
        },
        {
          path: 'devices/create',
          element: isWirelessHart ? <AddDeviceWirelessHart /> : <AddDevice />
        },
        { path: 'networks', element: isWirelessHart ? <NetworkWirelessHart /> : <Network /> },
        {
          path: 'networks/:id',
          element: isWirelessHart ? <NetworkDetailWirelessHart /> : <NetworkDetail />
        },
        {
          path: 'importNetwork',
          element: isWirelessHart ? <ImportNetworkWirelessHart /> : <ImportNetwork />
        },
        { path: 'firmwares', element: <Firmware /> },
        { path: 'alerts', element: <AlarmRecord /> },
        { path: 'alarmRules', element: <AlarmRuleGroups /> },
        { path: 'alarmRules/create', element: <CreateAlarmRuleGroups /> },
        { path: 'alarmRules/:id', element: <UpdateAlarmRuleGroups /> },
        { path: 'projects', element: <Project /> },
        { path: 'users', element: <User /> },
        { path: 'me', element: <Me /> },
        { path: 'roles', element: <Role /> },
        { path: 'systeminfo', element: <System /> },
        { path: 'reports', element: <ReportList /> },
        { path: 'reports/:id', element: <Report /> }
      ]
    }
  ];
  if (!isLogin()) {
    routes.push({
      path: '/login',
      element: <Login />
    });
  }
  const Routes = () => useRoutes(routes);
  const { language } = useLocaleContext();

  React.useEffect(() => {
    intl.init({
      locales: {
        'en-US': en_US,
        'zh-CN': zh_CN
      },
      currentLocale: language
    });
    setInitDone(true);
    if (language === 'zh-CN') {
      dayjs.locale('zh-cn');
    } else {
      dayjs.locale('en');
    }
  }, [language]);

  return (
    <>
      {initDone && (
        <ConfigProvider
          locale={language === 'zh-CN' ? zhCN : enUS}
          theme={{ components: { Menu: { itemHoverColor: '#1677ff' } } }}
        >
          <HashRouter>
            <Suspense
              fallback={
                <div style={{ display: 'flex', justifyContent: 'center', alignContent: 'center' }}>
                  <Spin />
                </div>
              }
            >
              <Routes />
            </Suspense>
          </HashRouter>
        </ConfigProvider>
      )}
    </>
  );
};

export default AppRouter;
