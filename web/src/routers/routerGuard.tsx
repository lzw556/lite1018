import { Redirect, Route } from 'react-router-dom';
import { getProject, isLogin } from '../utils/session';
import { getViewNameFromLocation } from '../utils/path';
import { findMenu } from './helper';
import { AssetViews } from '../views/home/common/constants';

const views = require('../views');

const RouterGuard = (props: any) => {
  const { routes, location } = props;
  const { pathname } = location;

  if (pathname === '/') {
    return <Redirect to={'/device-management?locale=devices'} />;
  }
  if (routes.length === 0) {
    return <Redirect to={'/403'} />;
  }
  const target = findMenu(routes, getViewNameFromLocation(location), pathname);
  if (target && views[target.view]) {
    const component = views[target.view];
    if (!target.isAuth) {
      return <Route exact path={target.path} key={target.name} component={component} />;
    }
    if (isLogin()) {
      if (AssetViews.find((view) => view === target.view)) {
        const prevProjectId = localStorage.getItem('prevProjectId');
        if (prevProjectId && getProject() !== Number(prevProjectId)) {
          localStorage.setItem('prevProjectId', getProject());
          return <Redirect to={`/project-overview?locale=project-overview`} />;
        }
      }
      return <Route exact path={target.path} key={target.name} component={component} />;
    } else {
      return <Redirect to='/login' />;
    }
  } else {
    return <Redirect to='/404' />;
  }
};

export default RouterGuard;
