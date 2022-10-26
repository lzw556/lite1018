import React, { Suspense } from 'react';
import { AppRoutes } from './routes';
import { HashRouter, Redirect, Route, Switch } from 'react-router-dom';
import ConsolePage from '../views/console';
import { isLogin } from '../utils/session';
import DashboardPage from '../views/dashboard';

const AppRouter = () => {
  return (
    <HashRouter basename='/'>
      <Suspense fallback={<div />}>
        <Switch>
          {AppRoutes.map((route) => {
            return <Route strict key={route.path} path={route.path} component={route.component} />;
          })}
          <Route
            strict
            path='/dashboard'
            key='dashboard'
            component={() => {
              return isLogin() ? <DashboardPage /> : <Redirect to='/login' />;
            }}
          />
          <ConsolePage />
        </Switch>
      </Suspense>
    </HashRouter>
  );
};

export default AppRouter;
