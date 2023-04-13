import { Button, Drawer, DrawerProps, Space, Tree } from 'antd';
import { FC, useEffect, useState } from 'react';
import { Role } from '../../../types/role';
import { GetMenusTreeRequest } from '../../../apis/menu';
import { Menu } from '../../../types/menu';
import { AllocMenusRequest } from '../../../apis/role';
import { Permission } from '../../../permission/permission';
import HasPermission from '../../../permission';
import intl from 'react-intl-universal';

export interface MenuDrawerProps extends DrawerProps {
  role: Role;
  onCancel: () => void;
}

const MenuDrawer: FC<MenuDrawerProps> = (props) => {
  const { role, open, onCancel } = props;
  const [menus, setMenus] = useState<Menu[]>();
  const [checkMenus, setCheckMenus] = useState<number[]>([]);

  useEffect(() => {
    if (open) {
      GetMenusTreeRequest().then((data) => {
        setMenus(data);
        setCheckMenus(role.menus);
      });
    }
  }, [open, role.menus]);

  const onSave = () => {
    AllocMenusRequest(role.id, checkMenus).then((_) => {
      onCancel();
    });
  };

  const renderExtra = () => {
    return (
      <Space>
        <Button onClick={onCancel}>{intl.get('CANCEL')}</Button>
        <HasPermission value={Permission.RoleAllocMenus}>
          <Button type={'primary'} onClick={onSave}>
            {intl.get('SAVE')}
          </Button>
        </HasPermission>
      </Space>
    );
  };

  const onCheck = (checkKeys: any, e: any) => {
    setCheckMenus(checkKeys.concat(e.halfCheckedKeys));
  };

  const renderDefaultCheckedKeys = () => {
    const parentKeys = menus?.filter((menu) => menu.path === '').map((menu) => menu.id);
    return role?.menus.filter((id) => !parentKeys?.includes(id));
  };

  const renderMenusTree = () => {
    if (menus && open) {
      return (
        <Tree
          defaultExpandAll={true}
          showIcon={true}
          selectable={false}
          checkable={true}
          defaultCheckedKeys={renderDefaultCheckedKeys()}
          treeData={convertTreeData(menus)}
          onCheck={onCheck}
        />
      );
    }
  };

  const convertTreeData = (children: Menu[]) => {
    return children
      .filter((item) => !item.hidden)
      .map((menu) => {
        const data: any = {
          title: intl.get(menu.title).d(menu.title),
          key: menu.id
        };
        if (menu.children) {
          data.children = convertTreeData(menu.children);
        }
        if (menu.icon) {
          data.icon = <span className={`iconfont ${menu.icon}`} />;
        }
        return data;
      });
  };

  return (
    <Drawer
      {...props}
      title={intl.get(role?.name).d(role?.name)}
      placement={'right'}
      onClose={onCancel}
      extra={renderExtra()}
    >
      {renderMenusTree()}
    </Drawer>
  );
};

export default MenuDrawer;
