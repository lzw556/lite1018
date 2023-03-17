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
  AddDevice
} from '../views';
import { PrimaryLayout } from '../views/layout/primaryLayout';
import { isLogin } from '../utils/session';
import { Spin } from 'antd';
import {
  ASSET_CATEGORY,
  useAssetCategoryContext
} from '../views/asset/components/assetCategoryContext';
import { FLANGE_PATHNAME } from '../views/flange';
import { MONITORING_POINT_PATHNAME } from '../views/monitoring-point';

const AssetViewSwitch = lazy(() => import('../views/asset/components/assetViewSwitch'));
const AlarmRuleGroups = lazy(() => import('../views/alarm/alarm-group/index'));
const CreateAlarmRuleGroups = lazy(() => import('../views/alarm/alarm-group/create'));
const UpdateAlarmRuleGroups = lazy(() => import('../views/alarm/alarm-group/update'));
//wind-turbine
const WindTurbines = lazy(() => import('../views/asset/wind-turbine/projectOverview'));
const WindTurbinesTreeList = lazy(() => import('../views/asset/wind-turbine/tree-list/index'));
const WindTurbinesTableList = lazy(() => import('../views/asset/wind-turbine/table-list/index'));
const WindTurbineShow = lazy(() => import('../views/asset/wind-turbine/show/index'));
const WindTurbineFlangeShow = lazy(() => import('../views/flange/show/index'));
const WindTurbineMonitoringPointShow = lazy(() => import('../views/monitoring-point/show/index'));

// hydro-turbine
// const HydroTurbines = lazy(() => import('../asset/hydro-turbine/index'));
// const HydroTurbinesTreeList = lazy(() => import('../asset/hydro-turbine/tree-list/index'));
// const HydroTurbinesTableList = lazy(() => import('../asset/hydro-turbine/table-list/index'));
// const HydroTurbineShow = lazy(() => import('../asset/hydro-turbine/root/show/index'));
// const HydroTurbineFlangeShow = lazy(() => import('../asset/hydro-turbine/flange/show/index'));
// const HydroTurbineMonitoringPointShow = lazy(
//   () => import('../asset/hydro-turbine/monitoring-point/show/index')
// );

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
          element: <AssetViewSwitch windTurbine={<WindTurbines />} />
        },
        {
          path: 'project-overview',
          element: <AssetViewSwitch windTurbine={<WindTurbines />} />
        },
        {
          path: `${ASSET_CATEGORY[category]}/:id`,
          element: (
            <AssetViewSwitch
              windTurbine={<WindTurbineShow />}
              // hydroTurbine={<HydroTurbineShow />}
            />
          )
        },
        {
          path: `${FLANGE_PATHNAME}/:id`,
          element: (
            <AssetViewSwitch
              windTurbine={<WindTurbineFlangeShow />}
              // hydroTurbine={<HydroTurbineFlangeShow />}
            />
          )
        },
        {
          path: `${MONITORING_POINT_PATHNAME}/:id`,
          element: (
            <AssetViewSwitch
              windTurbine={<WindTurbineMonitoringPointShow />}
              // hydroTurbine={<HydroTurbineMonitoringPointShow />}
            />
          )
        },
        {
          path: 'asset-management',
          element: (
            <AssetViewSwitch
              windTurbine={<WindTurbinesTreeList />}
              // hydroTurbine={<HydroTurbinesTreeList />}
            />
          )
        },
        {
          path: 'measurement-management',
          element: (
            <AssetViewSwitch
              windTurbine={<WindTurbinesTableList />}
              // hydroTurbine={<HydroTurbinesTableList />}
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
        { path: 'systeminfo', element: <System /> }
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
  return (
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
  );
};

export default AppRouter;
