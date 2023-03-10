import React, { Suspense } from 'react';
import { BrowserRouter, RouteObject, useRoutes } from 'react-router-dom';
import {
  ProjectOverview,
  AssetManagement,
  Device,
  DeviceDetail,
  Firmware,
  Login,
  Me,
  MeasurementManagement,
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
  AlarmRule,
  AlarmRuleGroupCreation,
  AlarmRuleGroupEdit,
  AddDevice
} from '../views';
import { PrimaryLayout } from '../views/layout/primaryLayout';
import { isLogin } from '../utils/session';
import { Spin } from 'antd';

const AppRouter = () => {
  const routes: RouteObject[] = [
    { path: '/403', element: <Unauthorized /> },
    { path: '*', element: <NotFound /> },
    { path: '/500', element: <ServerError /> },
    {
      path: '/',
      element: <PrimaryLayout />,
      children: [
        { index: true, element: <ProjectOverview /> },
        { path: 'project-overview', element: <ProjectOverview /> },
        { path: 'asset-management', element: <AssetManagement /> },
        { path: 'measurement-management', element: <MeasurementManagement /> },
        { path: 'devices', element: <Device /> },
        { path: 'devices/:id', element: <DeviceDetail /> },
        { path: 'devices/create', element: <AddDevice /> },
        { path: 'networks', element: <Network /> },
        { path: 'networks/:id', element: <NetworkDetail /> },
        { path: 'importNetwork', element: <ImportNetwork /> },
        { path: 'firmwares', element: <Firmware /> },
        { path: 'alerts', element: <AlarmRecord /> },
        { path: 'alarmRules', element: <AlarmRule /> },
        { path: 'alarmRules/create', element: <AlarmRuleGroupCreation /> },
        { path: 'alarmRules/:id', element: <AlarmRuleGroupEdit /> },
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
