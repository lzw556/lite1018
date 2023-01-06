import React, { Suspense } from 'react';
import { AppRoutes } from './routes';
import { HashRouter, Route, Switch } from 'react-router-dom';
import ConsolePage from '../views/console';

const AppRouter = () => {
  return (
    <HashRouter basename='/'>
      <Suspense fallback={<div />}>
        <Switch>
          {AppRoutes.map((route) => {
            return <Route strict key={route.path} path={route.path} component={route.component} />;
          })}
          <ConsolePage />
        </Switch>
      </Suspense>
    </HashRouter>
  );
};

export default AppRouter;
