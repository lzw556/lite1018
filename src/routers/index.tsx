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
import { useLocaleContext } from '../localeProvider';
import intl from 'react-intl-universal';
import en_US from '../locales/en-US.json';
import zh_CN from '../locales/zh-CN.json';
import zhCN from 'antd/es/locale/zh_CN';
import enUS from 'antd/es/locale/en_US';
import dayjs from '../utils/dayjsUtils';
import 'dayjs/locale/zh-cn';
import { AssetsContextProvider, ASSET_PATHNAME, useAppConfigContext } from '../views/asset';
import { SITE_NAMES } from '../config/assetCategory.config';
import { DevicesContextProvider } from '../views/device/index';

const AlarmRuleGroups = lazy(() => import('../views/alarm/alarm-group/index'));
const CreateAlarmRuleGroups = lazy(() => import('../views/alarm/alarm-group/create'));
const UpdateAlarmRuleGroups = lazy(() => import('../views/alarm/alarm-group/update'));

//wind-turbine
const Assets = lazy(() => import('../views/asset/projectOverview'));
const AssetsTreeList = lazy(() => import('../views/asset/tree-list/index'));
const AssetDetail = lazy(() => import('../views/asset/tree-list/detail'));

const AppRouter = () => {
  const config = useAppConfigContext();
  const isWirelessHart = config.type === 'corrosionWirelessHART';
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
          path: ASSET_PATHNAME,
          element: (
            <AssetsContextProvider>
              <AssetsTreeList />
            </AssetsContextProvider>
          ),
          children: [
            {
              path: ':id',
              element: <AssetDetail />
            }
          ]
        },
        {
          path: 'devices',
          element: isWirelessHart ? (
            <DeviceWirelessHart />
          ) : (
            <DevicesContextProvider>
              <Device />
            </DevicesContextProvider>
          ),
          children: [
            {
              path: ':id',
              element: isWirelessHart ? <DeviceDetailWirelessHart /> : <DeviceDetail />
            }
          ]
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
    document.title = intl.get(SITE_NAMES.get(config.type) ?? '');
  }, [language, config]);

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
