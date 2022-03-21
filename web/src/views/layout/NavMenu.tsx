import { Menu } from 'antd';
import * as React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu as MenuItem } from '../../types/menu';
import { GetParamValue } from '../../utils/path';

export const NavMenu: React.FC<{
  menus: MenuItem[];
  setVisible?: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ menus, setVisible }) => {
  const { pathname, search } = useLocation();
  const locale = GetParamValue(search, 'locale');
  const { SubMenu } = Menu;
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
            <NavLink
              to={`${item.path}?locale=${item.name}`}
              onClick={() => setVisible && setVisible(false)}
            >
              {item.title}
            </NavLink>
          </Menu.Item>
        );
      }
    });
  };

  if (menus.length === 0) return null;
  return (
    <Menu
      mode='inline'
      className='ts-menu'
      defaultSelectedKeys={['devices']}
      selectedKeys={locale ? locale.split('/') : []}
      defaultOpenKeys={[pathname.replace('/', '')]}
    >
      {menus &&
        menus.map((item: any) => {
          if (!item.hidden) {
            if (item.children && item.children.filter((item: any) => !item.hidden).length) {
              return (
                <SubMenu
                  key={item.name}
                  title={item.title}
                  icon={item.icon && <span className={`iconfont ${item.icon}`} />}
                >
                  {renderMenuItem(item.children)}
                </SubMenu>
              );
            }
            return (
              <Menu.Item
                key={item.name}
                icon={item.icon && <span className={`iconfont ${item.icon}`} />}
              >
                <NavLink to={`${item.path}?locale=${item.name}`} onClick={() => setVisible && setVisible(false)}>{item.title}</NavLink>
              </Menu.Item>
            );
          }
        })}
    </Menu>
  );
};
