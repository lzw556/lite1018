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
import MyBreadcrumb from '../../components/myBreadcrumb';
import HasPermission from '../../permission';
import { Permission } from '../../permission/permission';
import { PageResult } from '../../types/page';
import { isMobile } from '../../utils/deviceDetection';
import { Store, useStore } from '../../hooks/store';

const UserPage = () => {
  const [addUserVisible, setAddUserVisible] = useState<boolean>(false);
  const [editUserVisible, setEditUserVisible] = useState<boolean>(false);
  const [user, setUser] = useState(InitializeUserState);
  const [dataSource, setDataSource] = useState<PageResult<User[]>>();
  const [store, setStore, gotoPage] = useStore('accountList');

  const fetchUsers = (store: Store['accountList']) => {
    const {
      pagedOptions: { index, size }
    } = store;
    PagingUsersRequest(index, size).then(setDataSource);
  };

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
      title: '用户名',
      dataIndex: 'username',
      key: 'username'
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: '操作',
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
                title='确认要删除该用户吗?'
                onConfirm={() => onDelete(record.id)}
                okText='删除'
                cancelText='取消'
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
      <MyBreadcrumb>
        <Space>
          <HasPermission value={Permission.UserAdd}>
            <Button type='primary' onClick={() => setAddUserVisible(true)}>
              添加用户 <UserAddOutlined />
            </Button>
          </HasPermission>
        </Space>
      </MyBreadcrumb>
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
        visible={addUserVisible}
        onCancel={() => setAddUserVisible(false)}
        onSuccess={onAddUserSuccess}
      />
      <EditUserModal
        user={user}
        visible={editUserVisible}
        onCancel={() => setEditUserVisible(false)}
        onSuccess={onEditUserSuccess}
      />
    </Content>
  );
};

export default UserPage;
