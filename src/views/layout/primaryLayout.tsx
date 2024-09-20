import { Layout } from 'antd';
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useDispatch } from 'redux-react-hook';
import { GetMyMenusRequest } from '../../apis/menu';
import { GetCasbinRequest } from '../../apis/role';
import AlertMessageNotification from '../../components/notification/alert';
import { store } from '../../store';
import { setMenusAction } from '../../store/actions/getMenusSuccess';
import { SET_PERMISSION } from '../../store/actions/types';
import { isLogin } from '../../utils/session';
import HeaderLayout from './HeaderLayout';
import { ValidateProject } from './validateProject';
import './layout.css';
import { Menu } from '../../types/menu';

export const PrimaryLayout = () => {
  const [menus, setMenus] = React.useState<Menu[]>();
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (isLogin()) {
      GetCasbinRequest().then((data) => {
        store.dispatch({
          type: SET_PERMISSION,
          payload: data
        });
      });
    }
  }, [dispatch]);

  React.useEffect(() => {
    if (isLogin()) {
      GetMyMenusRequest().then((data) => {
        setMenus(data);
        dispatch(setMenusAction(data));
      });
    }
  }, [dispatch]);

  if (!isLogin()) {
    return <Navigate to='/login' />;
  }

  return (
    <Layout>
      <HeaderLayout menus={menus} />
      <Layout>
        <ValidateProject>
          <Outlet />
        </ValidateProject>
      </Layout>
      <AlertMessageNotification />
    </Layout>
  );
};
