import { Menu } from 'antd';
import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu as MenuItem } from '../../types/menu';
import { mapTree } from '../../utils/tree';
import intl from 'react-intl-universal';

export const NavMenu: React.FC<{
  menus: MenuItem[];
}> = ({ menus }) => {
  const { pathname, state } = useLocation();
  const [openKeys, setOpenKeys] = React.useState<string[]>(getInitialOpenKeys());
  const items = mapTree(menus, (m) => {
    let state = undefined;
    if (
      m.name === 'project-overview' ||
      m.name === 'asset-management' ||
      m.name === 'measurement-management'
    ) {
      state = { from: { path: m.path, label: intl.get(m.title) } };
    }
    const label = m.path ? (
      <Link to={`${m.name}`} state={state}>
        {intl.get(m.title)}
      </Link>
    ) : (
      intl.get(m.title)
    );
    const key = m.name;
    const icon = m.icon ? <span className={`iconfont ${m.icon}`} /> : null;
    if (m.children && m.children.length > 0) {
      return { label, key, icon, sort: m.sort, children: m.children.sort(sortMenus) };
    } else {
      return { label, key, icon, sort: m.sort };
    }
  });

  const menuPaths = pathname
    .split('/')
    .filter((p) => p.length > 0)
    .filter((p) => Number.isNaN(Number(p)));
  const from = state?.from?.path?.replace('/', '');
  const selectedKeys = from ? [from] : menuPaths.length > 0 ? menuPaths : undefined;

  function getInitialOpenKeys() {
    const local = localStorage.getItem('menuOpenKeys');
    return local ? JSON.parse(local) : undefined;
  }

  React.useEffect(() => {
    if (openKeys) {
      localStorage.setItem('menuOpenKeys', JSON.stringify(openKeys));
    }
  }, [openKeys]);

  return (
    <Menu
      mode='inline'
      className='ts-menu'
      items={items}
      defaultSelectedKeys={['project-overview']}
      selectedKeys={selectedKeys}
      openKeys={openKeys}
      onOpenChange={(openKeys) => {
        setOpenKeys(openKeys);
        console.log(openKeys);
      }}
    />
  );

  function sortMenus(prev: MenuItem, next: MenuItem) {
    return (prev.sort || 0) - (next.sort || 0);
  }
};
