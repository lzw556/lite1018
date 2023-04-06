import { Button, Col, Popconfirm, Row, Space } from 'antd';
import { useEffect, useState } from 'react';
import { Content } from 'antd/lib/layout/layout';
import { GetUserRequest, PagingUsersRequest, RemoveUserRequest } from '../../apis/user';
import TableLayout from '../layout/TableLayout';
import { InitializeUserState, User } from '../../types/user';
import { DeleteOutlined, EditOutlined, UserAddOutlined } from '@ant-design/icons';
import AddUserModal from './add';
import EditUserModal from './edit';
import ShadowCard from '../../components/shadowCard';
import HasPermission from '../../permission';
import { Permission } from '../../permission/permission';
import { PageResult } from '../../types/page';
import { isMobile } from '../../utils/deviceDetection';
import { Store, useStore } from '../../hooks/store';
import { Role } from '../../types/role';
import { PagingRolesRequest } from '../../apis/role';
import { PageTitle } from '../../components/pageTitle';
import intl from 'react-intl-universal';

const UserPage = () => {
  const [addUserVisible, setAddUserVisible] = useState<boolean>(false);
  const [editUserVisible, setEditUserVisible] = useState<boolean>(false);
  const [user, setUser] = useState(InitializeUserState);
  const [dataSource, setDataSource] = useState<PageResult<User[]>>();
  const [store, setStore, gotoPage] = useStore('accountList');
  const [roles, setRoles] = useState<Role[]>([]);

  const fetchUsers = (store: Store['accountList']) => {
    const {
      pagedOptions: { index, size }
    } = store;
    PagingUsersRequest(index, size).then(setDataSource);
  };

  useEffect(() => {
    PagingRolesRequest(1, 100).then((data) => {
      setRoles(data.result);
    });
  }, []);

  useEffect(() => {
    fetchUsers(store);
  }, [store]);

  const onAddUserSuccess = () => {
    setAddUserVisible(false);
    if (dataSource) {
      const { size, page, total } = dataSource;
      gotoPage({ size, total, index: page }, 'next');
    }
  };

  const onEdit = async (id: number) => {
    GetUserRequest(id).then((data) => {
      setUser(data);
      setEditUserVisible(true);
    });
  };

  const onEditUserSuccess = () => {
    setEditUserVisible(false);
    fetchUsers(store);
  };

  const onDelete = (id: number) => {
    RemoveUserRequest(id).then((_) => {
      if (dataSource) {
        const { size, page, total } = dataSource;
        gotoPage({ size, total, index: page }, 'prev');
      }
    });
  };

  const columns = [
    {
      title: intl.get('USERNAME'),
      dataIndex: 'username',
      key: 'username'
    },
    {
      title: intl.get('CELLPHONE'),
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: intl.get('EMAIL'),
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: intl.get('ROLE'),
      dataIndex: 'role',
      render: (roleId: number) => {
        const role = roles.find((role) => role.id === roleId);
        return role?.name ? intl.get(role?.name) : '';
      },
      key: 'role'
    },
    {
      title: intl.get('OPERATION'),
      key: 'action',
      render: (text: any, record: any) => {
        if (record.id === 1) {
          return <div />;
        }
        return (
          <Space>
            <HasPermission value={Permission.UserEdit}>
              <Button
                type='text'
                size='small'
                icon={<EditOutlined />}
                onClick={() => onEdit(record.id)}
              />
            </HasPermission>
            <HasPermission value={Permission.UserDelete}>
              <Popconfirm
                placement='left'
                title={intl.get('DELETE_USER_PROMPT')}
                onConfirm={() => onDelete(record.id)}
                okText={intl.get('DELETE')}
                cancelText={intl.get('CANCEL')}
              >
                <Button type='text' size='small' icon={<DeleteOutlined />} danger />
              </Popconfirm>
            </HasPermission>
          </Space>
        );
      }
    }
  ];

  return (
    <Content>
      <PageTitle
        items={[{ title: intl.get('MENU_USER_MANAGEMENT') }]}
        actions={
          <HasPermission value={Permission.UserAdd}>
            <Button type='primary' onClick={() => setAddUserVisible(true)}>
              {intl.get('CREATE_USER')} <UserAddOutlined />
            </Button>
          </HasPermission>
        }
      />
      <Row justify='center'>
        <Col span={24}>
          <ShadowCard>
            <TableLayout
              columns={columns}
              permissions={[Permission.UserDelete, Permission.UserEdit]}
              dataSource={dataSource}
              onPageChange={(index, size) =>
                setStore((prev) => ({ ...prev, pagedOptions: { index, size } }))
              }
              simple={isMobile}
              scroll={isMobile ? { x: 600 } : undefined}
            />
          </ShadowCard>
        </Col>
      </Row>
      <AddUserModal
        open={addUserVisible}
        onCancel={() => setAddUserVisible(false)}
        onSuccess={onAddUserSuccess}
      />
      <EditUserModal
        user={user}
        open={editUserVisible}
        onCancel={() => setEditUserVisible(false)}
        onSuccess={onEditUserSuccess}
      />
    </Content>
  );
};

export default UserPage;
