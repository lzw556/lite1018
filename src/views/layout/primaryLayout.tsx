import { Layout } from 'antd';
import Sider from 'antd/lib/layout/Sider';
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
import { NavMenu } from './NavMenu';
import { ValidateProject } from './validateProject';
import './layout.css';
import { Menu } from '../../types/menu';
import { MENUS_HIDDEN } from '../../config/assetCategory.config';
import { AppConfig, useAppConfigContext } from '../asset';

export const PrimaryLayout = () => {
  const [menus, setMenus] = React.useState<Menu[]>();
  const dispatch = useDispatch();
  const config = useAppConfigContext();

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
        const filters = hideMenus(data, config);
        setMenus(filters);
        dispatch(setMenusAction(filters));
      });
    }
  }, [dispatch, config]);

  if (!isLogin()) {
    return <Navigate to='/login' />;
  }

  return (
    <Layout className='ts-console'>
      <HeaderLayout hideConsole={true} menus={menus} />
      <Layout hasSider>
        <Sider
          className='sider'
          width={230}
          style={{
            background: 'white',
            height: '100%',
            overflowY: 'scroll',
            boxShadow: '0 2px 10px 0 rgba(0,0,0, 0.08)'
          }}
        >
          {menus && <NavMenu menus={menus} />}
        </Sider>
        <Layout style={{ padding: 16, background: '#eef0f5', overflowY: 'scroll' }}>
          <ValidateProject>
            <Outlet />
          </ValidateProject>
        </Layout>
      </Layout>
      <AlertMessageNotification />
    </Layout>
  );
};

function hideMenus(menus: Menu[], config: AppConfig) {
  const filter = (m: Menu) => !MENUS_HIDDEN.get(config)?.includes(m.name);
  return menus.filter(filter).map((m) => ({ ...m, children: m.children.filter(filter) }));
}
