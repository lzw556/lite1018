import { Button, Space } from 'antd';
import { Content } from 'antd/es/layout/layout';
import TableLayout from '../../layout/TableLayout';
import ShadowCard from '../../../components/shadowCard';
import { useCallback, useEffect, useState } from 'react';
import { GetRoleRequest, PagingRolesRequest } from '../../../apis/role';
import AddRoleModal from './modal/add';
import EditRoleModal from './modal/edit';
import { Role } from '../../../types/role';
import MenuDrawer from './menuDrawer';
import PermissionDrawer from './permissionDrawer';
import usePermission, { Permission } from '../../../permission/permission';
import { PageResult } from '../../../types/page';
import { isMobile } from '../../../utils/deviceDetection';
import { PageTitle } from '../../../components/pageTitle';
import intl from 'react-intl-universal';

const RolePage = () => {
  const [addVisible, setAddVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [permissionVisible, setPermissionVisible] = useState(false);
  const [role, setRole] = useState<Role>();
  const [dataSource, setDataSource] = useState<PageResult<any>>();
  const [refreshKey, setRefreshKey] = useState(0);
  const { hasPermission } = usePermission();

  const fetchRoles = useCallback(
    (current, size) => {
      PagingRolesRequest(current, size).then(setDataSource);
    },
    [refreshKey]
  );

  useEffect(() => {
    fetchRoles(1, 10);
  }, [fetchRoles]);

  const onRefresh = () => {
    setRefreshKey(refreshKey + 1);
  };

  const onAllocMenus = (id: number) => {
    GetRoleRequest(id).then((data) => {
      setRole(data);
      setMenuVisible(true);
    });
  };

  const columns = [
    {
      title: intl.get('ROLE_NAME'),
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => {
        return intl.get(record.name);
      }
    },
    {
      title: intl.get('ROLE_DESCRIPTION'),
      dataIndex: 'description',
      key: 'description',
      render: (text: string, record: any) => {
        return intl.get(record.description);
      }
    },
    {
      title: intl.get('OPERATION'),
      key: 'action',
      width: '25%',
      render: (text: string, record: any) => {
        return (
          <Space>
            {hasPermission(Permission.RoleAllocMenus) && (
              <Button
                type={'link'}
                size={'small'}
                onClick={() => {
                  onAllocMenus(record.id);
                }}
              >
                {intl.get('ASSIGN_MENUS')}
              </Button>
            )}
          </Space>
        );
      }
    }
  ];

  return (
    <Content>
      <PageTitle items={[{ title: intl.get('MENU_ROLE_MANAGEMENT') }]} />
      <ShadowCard>
        <TableLayout
          emptyText={intl.get('NO_ROLES')}
          permissions={[
            Permission.RoleAllocMenus,
            Permission.RoleAllocPermissions,
            Permission.RoleDelete
          ]}
          columns={columns}
          dataSource={dataSource}
          onPageChange={fetchRoles}
          simple={isMobile}
          scroll={isMobile ? { x: 600 } : undefined}
        />
      </ShadowCard>
      <AddRoleModal
        visible={addVisible}
        onCancel={() => setAddVisible(false)}
        onSuccess={() => {
          setAddVisible(false);
          onRefresh();
        }}
      />
      {role && (
        <EditRoleModal
          role={role}
          visible={editVisible}
          onCancel={() => setEditVisible(false)}
          onSuccess={() => {
            setEditVisible(false);
            onRefresh();
          }}
        />
      )}
      {role && (
        <MenuDrawer role={role} visible={menuVisible} onCancel={() => setMenuVisible(false)} />
      )}
      {role && (
        <PermissionDrawer
          role={role}
          visible={permissionVisible}
          onCancel={() => setPermissionVisible(false)}
        />
      )}
    </Content>
  );
};

export default RolePage;
