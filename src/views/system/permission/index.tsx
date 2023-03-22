import MyBreadcrumb from '../../../components/myBreadcrumb';
import { Content } from 'antd/es/layout/layout';
import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useCallback, useState } from 'react';
import ShadowCard from '../../../components/shadowCard';
import { PagingPermissionsRequest } from '../../../apis/permission';
import AddPermissionModal from './modal/add';
import intl from 'react-intl-universal';

const PermissionPage = () => {
  const [addVisible, setAddVisible] = useState(false);

  const onChange = useCallback((current: number, size: number) => {
    PagingPermissionsRequest(current, size).then((res) => {
      if (res.code === 200) {
      }
    });
  }, []);

  const onRefresh = () => {};

  const columns = [
    {
      title: intl.get('PATH'),
      dataIndex: 'path',
      key: 'path'
    },
    {
      title: intl.get('DESCRIPTION'),
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: intl.get('REQUEST'),
      dataIndex: 'method',
      key: 'method'
    }
  ];

  return (
    <Content>
      <MyBreadcrumb>
        <Button type={'primary'} onClick={() => setAddVisible(true)}>
          {intl.get('ADD_PRIVILEDGE')} <PlusOutlined />
        </Button>
      </MyBreadcrumb>
      <ShadowCard></ShadowCard>
      <AddPermissionModal
        visible={addVisible}
        onCancel={() => {
          setAddVisible(false);
        }}
        onSuccess={() => {
          setAddVisible(false);
          onRefresh();
        }}
      />
    </Content>
  );
};

export default PermissionPage;
