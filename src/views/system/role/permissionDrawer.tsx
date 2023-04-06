import { Button, Drawer, DrawerProps, Space, Tree } from 'antd';
import { Role } from '../../../types/role';
import { FC, useEffect, useState } from 'react';
import { GetPermissionsWithGroupRequest } from '../../../apis/permission';
import { AllocPermissionsRequest } from '../../../apis/role';
import { Permission } from '../../../permission/permission';
import HasPermission from '../../../permission';
import intl from 'react-intl-universal';

export interface PermissionDrawerProps extends DrawerProps {
  role: Role;
  onCancel: () => void;
}

const PermissionDrawer: FC<PermissionDrawerProps> = (props) => {
  const { role, open, onCancel } = props;
  const [permissions, setPermissions] = useState<any>();
  const [checkPermissions, setCheckPermissions] = useState<any[]>([]);

  useEffect(() => {
    const convertCheckPermissions = (data: any) => {
      const ps = role.permissions.map((item: any) => `${item[0]}::${item[1]}`);
      const checked: any[] = [];
      Object.keys(data).forEach((key) => {
        data[key]
          .filter((item: any) => {
            return ps.includes(`${item.path}::${item.method}`);
          })
          .forEach((item: any) => {
            checked.push(item.id);
          });
      });
      setCheckPermissions(checked);
    };
    if (open) {
      GetPermissionsWithGroupRequest().then((res) => {
        if (res.code === 200) {
          setPermissions(res.data);
          convertCheckPermissions(res.data);
        }
      });
    }
  }, [open, role.permissions]);

  const onSave = () => {
    AllocPermissionsRequest(
      role.id,
      checkPermissions.filter((item) => typeof item !== 'string')
    ).then((_) => {
      onCancel();
    });
  };

  const renderExtra = () => {
    return (
      <Space>
        <Button onClick={onCancel}>{intl.get('CANCEL')}</Button>
        <HasPermission value={Permission.RoleAllocPermissions}>
          <Button type={'primary'} onClick={onSave}>
            {intl.get('SAVE')}
          </Button>
        </HasPermission>
      </Space>
    );
  };

  const onCheck = (checkKeys: any, e: any) => {
    setCheckPermissions(checkKeys);
  };

  const convertTreeData = () => {
    const treeData: any[] = [];
    Object.keys(permissions).forEach((key) => {
      treeData.push({
        title: intl.get(key).d(key),
        key: key,
        checkable: true,
        children: permissions[key].map((item: any) => {
          return {
            title: item.description,
            key: item.id
          };
        })
      });
    });
    return treeData;
  };

  const convertPermissionTree = () => {
    if (permissions && open) {
      return (
        <Tree
          defaultExpandAll={true}
          checkable={true}
          showIcon={true}
          selectable={false}
          checkedKeys={checkPermissions}
          treeData={convertTreeData()}
          onCheck={onCheck}
        />
      );
    }
  };

  return (
    <Drawer
      {...props}
      title={role?.name}
      placement={'right'}
      onClose={onCancel}
      extra={renderExtra()}
    >
      {convertPermissionTree()}
    </Drawer>
  );
};

export default PermissionDrawer;
