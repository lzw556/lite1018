import { Menu } from 'antd';
import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu as MenuItem } from '../../types/menu';
import { dfsTransformTree } from '../../utils/tree';

export const NavMenu: React.FC<{
  menus: MenuItem[];
}> = ({ menus }) => {
  const { pathname, state } = useLocation();
  const items = dfsTransformTree(menus, (m) => {
    const label = m.path ? (
      <Link to={`${m.name}`} state={{ from: { path: m.path, label: m.title } }}>
        {m.title}
      </Link>
    ) : (
      m.title
    );
    const key = m.name;
    const icon = m.icon ? <span className={`iconfont ${m.icon}`} /> : null;
    if (m.children && m.children.length > 0) {
      return { label, key, icon, children: m.children.sort(sortMenus) };
    } else {
      return { label, key, icon };
    }
  });
  const menuPaths = pathname
    .split('/')
    .filter((p) => p.length > 0)
    .filter((p) => Number.isNaN(Number(p)));
  const from = state?.from?.path?.replace('/', '');
  const selectedKeys = from ? [from] : menuPaths.length > 0 ? menuPaths : undefined;

  return (
    <Menu
      mode='inline'
      className='ts-menu'
      items={items}
      defaultSelectedKeys={['project-overview']}
      selectedKeys={selectedKeys}
    />
  );

  function sortMenus(prev: MenuItem, next: MenuItem) {
    return (prev.sort || 0) - (next.sort || 0);
  }
};
