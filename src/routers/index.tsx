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
import { App, useAppType } from '../config';
import { ASSET_PATHNAME } from '../views/asset-common';

const AlarmRuleGroups = lazy(() => import('../views/alarm/alarm-group/index'));
const CreateAlarmRuleGroups = lazy(() => import('../views/alarm/alarm-group/create'));
const UpdateAlarmRuleGroups = lazy(() => import('../views/alarm/alarm-group/update'));

const Assets = lazy(() => import('../views/home'));
const Asset = lazy(() => import('../views/home/main'));

const AppRouter = () => {
  const config = useAppType();
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
        { index: true, element: <Assets /> },
        {
          path: ASSET_PATHNAME,
          element: <Assets />,
          children: [
            {
              path: ':id',
              element: <Asset />
            }
          ]
        },
        {
          path: 'devices',
          element: isWirelessHart ? <DeviceWirelessHart /> : <Device />,
          children: [
            {
              path: 'create',
              element: isWirelessHart ? <AddDeviceWirelessHart /> : <AddDevice />
            },
            {
              path: 'import',
              element: isWirelessHart ? <ImportNetworkWirelessHart /> : <ImportNetwork />
            },
            {
              path: ':id',
              element: isWirelessHart ? <DeviceDetailWirelessHart /> : <DeviceDetail />
            }
          ]
        },
        { path: 'networks', element: isWirelessHart ? <NetworkWirelessHart /> : <Network /> },
        {
          path: 'networks/:id',
          element: isWirelessHart ? <NetworkDetailWirelessHart /> : <NetworkDetail />
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
    document.title = intl.get(App.getSiteName(config));
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
