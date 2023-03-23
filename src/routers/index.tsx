import React, { lazy, Suspense } from 'react';
import { BrowserRouter, RouteObject, useRoutes } from 'react-router-dom';
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
  Report
} from '../views';
import { PrimaryLayout } from '../views/layout/primaryLayout';
import { isLogin } from '../utils/session';
import { ConfigProvider, Spin } from 'antd';
import {
  ASSET_CATEGORY,
  useAssetCategoryContext
} from '../views/asset/components/assetCategoryContext';
import { FLANGE_PATHNAME } from '../views/flange';
import { MONITORING_POINT_PATHNAME } from '../views/monitoring-point';
import { useLocaleContext } from '../localeProvider';
import useForceUpdate from 'use-force-update';
import intl from 'react-intl-universal';
import en_US from '../locales/en-US.json';
import zh_CN from '../locales/zh-CN.json';
import zhCN from 'antd/es/locale/zh_CN';
import enUS from 'antd/es/locale/en_US';
import dayjs from '../utils/dayjsUtils';
import 'dayjs/locale/zh-cn';

const AssetViewSwitch = lazy(() => import('../views/asset/components/assetViewSwitch'));
const AlarmRuleGroups = lazy(() => import('../views/alarm/alarm-group/index'));
const CreateAlarmRuleGroups = lazy(() => import('../views/alarm/alarm-group/create'));
const UpdateAlarmRuleGroups = lazy(() => import('../views/alarm/alarm-group/update'));

//general
const Generals = lazy(() => import('../views/asset/general/projectOverview'));
const GeneralsTreeList = lazy(() => import('../views/asset/general/tree-list/index'));
const GeneralShow = lazy(() => import('../views/asset/general/show/index'));
const GeneralMonitoringPointShow = lazy(
  () => import('../views/monitoring-point/show/general/index')
);

//corrosion
const Areas = lazy(() => import('../views/asset/corrosion/projectOverview'));
const AreasTreeList = lazy(() => import('../views/asset/corrosion/tree-list/index'));
const AreasTableList = lazy(() => import('../views/asset/corrosion/table-list/index'));
const AreaShow = lazy(() => import('../views/asset/corrosion/show/index'));
const AreaMonitoringPointShow = lazy(
  () => import('../views/monitoring-point/show/corrosion/index')
);

//wind-turbine
const WindTurbines = lazy(() => import('../views/asset/wind-turbine/projectOverview'));
const WindTurbinesTreeList = lazy(() => import('../views/asset/wind-turbine/tree-list/index'));
const WindTurbinesTableList = lazy(() => import('../views/asset/wind-turbine/table-list/index'));
const WindTurbineShow = lazy(() => import('../views/asset/wind-turbine/show/index'));
const WindTurbineFlangeShow = lazy(() => import('../views/flange/show/wind-turbine/index'));
const WindTurbineMonitoringPointShow = lazy(
  () => import('../views/monitoring-point/show/wind-turbine/index')
);

//hydro-turbine
const HydroTurbines = lazy(() => import('../views/asset/hydro-turbine/projectOverview'));
const HydroTurbinesTreeList = lazy(() => import('../views/asset/hydro-turbine/tree-list/index'));
const HydroTurbinesTableList = lazy(() => import('../views/asset/hydro-turbine/table-list/index'));
const HydroTurbineShow = lazy(() => import('../views/asset/hydro-turbine/show/index'));
const HydroTurbineFlangeShow = lazy(() => import('../views/flange/show/hydro-turbine/index'));
const HydroTurbineMonitoringPointShow = lazy(
  () => import('../views/monitoring-point/show/hydro-turbine/index')
);

const AppRouter = () => {
  const category = useAssetCategoryContext();
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
            <AssetViewSwitch
              general={<Generals />}
              windTurbine={<WindTurbines />}
              hydroTurbine={<HydroTurbines />}
              corrosion={<Areas />}
            />
          )
        },
        {
          path: 'project-overview',
          element: (
            <AssetViewSwitch
              general={<Generals />}
              windTurbine={<WindTurbines />}
              hydroTurbine={<HydroTurbines />}
              corrosion={<Areas />}
            />
          )
        },
        {
          path: `${ASSET_CATEGORY[category]}/:id`,
          element: (
            <AssetViewSwitch
              general={<GeneralShow />}
              windTurbine={<WindTurbineShow />}
              hydroTurbine={<HydroTurbineShow />}
              corrosion={<AreaShow />}
            />
          )
        },
        {
          path: `${FLANGE_PATHNAME}/:id`,
          element: (
            <AssetViewSwitch
              windTurbine={<WindTurbineFlangeShow />}
              hydroTurbine={<HydroTurbineFlangeShow />}
            />
          )
        },
        {
          path: `${MONITORING_POINT_PATHNAME}/:id`,
          element: (
            <AssetViewSwitch
              general={<GeneralMonitoringPointShow />}
              windTurbine={<WindTurbineMonitoringPointShow />}
              hydroTurbine={<HydroTurbineMonitoringPointShow />}
              corrosion={<AreaMonitoringPointShow />}
            />
          )
        },
        {
          path: 'asset-management',
          element: (
            <AssetViewSwitch
              general={<GeneralsTreeList />}
              windTurbine={<WindTurbinesTreeList />}
              hydroTurbine={<HydroTurbinesTreeList />}
              corrosion={<AreasTreeList />}
            />
          )
        },
        {
          path: 'measurement-management',
          element: (
            <AssetViewSwitch
              windTurbine={<WindTurbinesTableList />}
              hydroTurbine={<HydroTurbinesTableList />}
              corrosion={<AreasTableList />}
            />
          )
        },
        { path: 'devices', element: <Device /> },
        { path: 'devices/:id', element: <DeviceDetail /> },
        { path: 'devices/create', element: <AddDevice /> },
        { path: 'networks', element: <Network /> },
        { path: 'networks/:id', element: <NetworkDetail /> },
        { path: 'importNetwork', element: <ImportNetwork /> },
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
        { path: 'Reports', element: <Report /> }
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
  const forceUpdate = useForceUpdate();

  React.useEffect(() => {
    intl.init({
      locales: {
        'en-US': en_US,
        'zh-CN': zh_CN
      },
      currentLocale: language
    });
    if (language === 'zh-CN') {
      dayjs.locale('zh-cn');
    } else {
      dayjs.locale('en');
    }
    forceUpdate();
  }, [language, forceUpdate]);

  return (
    <ConfigProvider locale={language === 'zh-CN' ? zhCN : enUS}>
      <BrowserRouter>
        <Suspense
          fallback={
            <div style={{ display: 'flex', justifyContent: 'center', alignContent: 'center' }}>
              <Spin />
            </div>
          }
        >
          <Routes />
        </Suspense>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default AppRouter;
