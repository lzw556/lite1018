import { Layout, Menu, Result, Spin } from 'antd';
import '../../App.css';
import './layout.css';
import { NavLink } from 'react-router-dom';
import RouterGuard from '../../routers/routerGuard';
import { HeaderLayout } from './index';
import '../../assets/iconfont.css';
import React, { useEffect } from 'react';
import { GetParamValue } from '../../utils/path';
import { SecondaryRoutes } from '../../routers/routes';
import AlertMessageNotification from '../../components/notification/alert';
import { getProject } from '../../utils/session';
import { GetCasbinRequest } from '../../apis/role';
import { store } from '../../store';
import { SET_PERMISSION } from '../../store/actions/types';
import { NavMenu } from './NavMenu';
import intl from 'react-intl-universal';

const { SubMenu } = Menu;

const { Sider } = Layout;

const ConsoleLayout = (props: any) => {
  const { menus, location } = props;
  const { pathname } = location;
  const locale = GetParamValue(location.search, 'locale');

  useEffect(() => {
    GetCasbinRequest().then((data) => {
      store.dispatch({
        type: SET_PERMISSION,
        payload: data
      });
    });
  }, []);

  const renderMenuItem = (children: []) => {
    return children.map((item: any) => {
      if (!item.hidden) {
        if (item.children && item.children.filter((item: any) => !item.hidden).length) {
          return (
            <SubMenu key={item.name} title={item.title}>
              {renderMenuItem(item.children)}
            </SubMenu>
          );
        }
        return (
          <Menu.Item key={item.name}>
            <NavLink to={`${item.path}?locale=${item.name}`}>{item.title}</NavLink>
          </Menu.Item>
        );
      }
    });
  };

  const flattenRoutes: any = (children: any) => {
    return children.reduce((acc: any, curr: any) => {
      acc.push(curr);
      return acc.concat(curr.children ? flattenRoutes(curr.children) : []);
    }, []);
  };

  const renderChildren = () => {
    const project = getProject();
    if (project) {
      return (
        <>
          <Layout>
            <Sider
              className='sider'
              width={200}
              style={{
                background: 'white',
                height: '100%',
                overflowY: 'scroll',
                boxShadow: '0 2px 10px 0 rgba(0,0,0, 0.08)'
              }}
            >
              <NavMenu menus={menus} />
            </Sider>
            <Layout style={{ padding: '15px', background: '#eef0f5', overflowY: 'scroll' }}>
              {<RouterGuard {...props} routes={SecondaryRoutes.concat(flattenRoutes(menus))} />}
            </Layout>
          </Layout>
          <AlertMessageNotification />
        </>
      );
    } else if (project === undefined) {
      return (
        <Result
          status='404'
          title={intl.get('FAILED_TO_FIND_ONE_PROJECT')}
          subTitle={intl.get('CONNECT_ADMIN_PROMPT')}
        />
      );
    }
    return (
      <div style={{ position: 'absolute', width: '100%', height: '80%', textAlign: 'center' }}>
        <Spin
          size={'large'}
          tip={intl.get('LOADING')}
          spinning={true}
          style={{ position: 'absolute', paddingTop: '25%' }}
        />
      </div>
    );
  };

  return (
    <Layout className='ts-console'>
      <HeaderLayout hideConsole={true} menus={menus} />
      {renderChildren()}
    </Layout>
  );
};

export default ConsoleLayout;
