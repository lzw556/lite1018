import { Content } from 'antd/lib/layout/layout';
import { useEffect, useState } from 'react';
import {
  DeleteNetworkRequest,
  ExportNetworkRequest,
  GetNetworkRequest,
  PagingNetworksRequest,
  NetworkSyncRequest,
  NetworkProvisionRequest
} from '../../apis/network';
import ShadowCard from '../../components/shadowCard';
import './index.css';
import TableLayout from '../layout/TableLayout';
import AddNetworkModal from './modal/addNetworkModal';
import { Button, Col, Dropdown, Menu, message, Popconfirm, Row, Space } from 'antd';
import { CodeOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Network, NetworkProvisioningMode } from '../../types/network';
import EditNetworkModal from './modal/editNetworkModal';
import dayjs from '../../utils/dayjsUtils';
import { PageResult } from '../../types/page';
import usePermission, { Permission } from '../../permission/permission';
import HasPermission from '../../permission';
import { isMobile } from '../../utils/deviceDetection';
import { Link } from 'react-router-dom';
import { Store, useStore } from '../../hooks/store';
import { PageTitle } from '../../components/pageTitle';

const NetworkPage = () => {
  const { hasPermission, hasPermissions } = usePermission();
  const [addVisible, setAddVisible] = useState<boolean>(false);
  const [editVisible, setEditVisible] = useState<boolean>(false);
  const [network, setNetwork] = useState<Network>();
  const [dataSource, setDataSource] = useState<PageResult<any>>();
  const [store, setStore, gotoPage] = useStore('networkList');
  const [deviceListStore, setDeviceListStore] = useStore('deviceList');

  const fetchNetworks = (store: Store['networkList']) => {
    const {
      pagedOptions: { index, size }
    } = store;
    PagingNetworksRequest({}, index, size).then(setDataSource);
  };

  useEffect(() => {
    fetchNetworks(store);
  }, [store]);

  const onDelete = (id: number, index: number) => {
    DeleteNetworkRequest(id).then(() => {
      if (dataSource) {
        const { size, page, total } = dataSource;
        gotoPage({ size, total, index: page }, 'prev');
      }
      if (
        deviceListStore.filters &&
        deviceListStore.filters.network_id &&
        deviceListStore.filters.network_id === id
      ) {
        setDeviceListStore((prev) => {
          const prevFilter = prev.filters;
          delete prevFilter?.network_id;
          return { ...prev, filters: prevFilter };
        });
      }
    });
  };

  const onCommand = (record: Network, key: any) => {
    switch (key) {
      case '0':
        NetworkSyncRequest(record.id).then((res) => {
          if (res.code === 200) {
            message.success('发送成功');
          } else {
            message.error(`发送失败: ${res.msg}`);
          }
        });
        break;
      case '1':
        NetworkProvisionRequest(record.id).then((res) => {
          if (res.code === 200) {
            message.success('发送成功');
          } else {
            message.error(`发送失败: ${res.msg}`);
          }
        });
        break;
      case '2':
        exportNetwork(record);
        break;
    }
  };

  const exportNetwork = (n: Network) => {
    ExportNetworkRequest(n.id).then((res) => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${n.name}.json`);
      document.body.appendChild(link);
      link.click();
    });
  };

  const renderCommandMenus = (record: Network) => {
    return (
      <Menu
        onClick={(e) => {
          onCommand(record, e.key);
        }}
      >
        {hasPermission(Permission.NetworkSync) && <Menu.Item key={0}>同步网络</Menu.Item>}
        {hasPermission(Permission.NetworkProvision) && <Menu.Item key={1}>继续组网</Menu.Item>}
        {hasPermission(Permission.NetworkExport) && <Menu.Item key={2}>导出网络</Menu.Item>}
      </Menu>
    );
  };

  const onEdit = (id: number) => {
    GetNetworkRequest(id).then((data) => {
      setNetwork(data);
      setEditVisible(true);
    });
  };

  const columns = [
    {
      title: '网络名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Network) => {
        if (hasPermission(Permission.NetworkDetail)) {
          return <Link to={`${record.id}`}>{text}</Link>;
        }
        return text;
      }
    },
    {
      title: '模式',
      dataIndex: 'mode',
      key: 'mode',
      render: (mode: number) => {
        return NetworkProvisioningMode.toString(mode);
      }
    },
    {
      title: '通讯周期',
      dataIndex: 'communicationPeriod',
      key: 'communicationPeriod',
      render: (text: number, record: Network) => {
        return dayjs.duration(text / 1000, 'seconds').humanize();
      }
    },
    {
      title: '通讯延时',
      dataIndex: 'communicationOffset',
      key: 'communicationOffset',
      render: (text: number, record: Network) => {
        if (text === 0) {
          return '无';
        }
        if (text / 1000 < 60 || (text / 1000) % 60 !== 0) {
          return `${text / 1000}秒`;
        }
        return dayjs.duration(text / 1000, 'seconds').humanize();
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (text: any, record: any, index: number) => (
        <Space size={'middle'}>
          {hasPermission(Permission.NetworkEdit) && (
            <Button
              type='text'
              size='small'
              icon={<EditOutlined />}
              onClick={() => onEdit(record.id)}
            />
          )}
          {
            <Dropdown overlay={renderCommandMenus(record)}>
              <Button
                type='text'
                icon={<CodeOutlined />}
                hidden={
                  !(
                    hasPermission(Permission.NetworkExport) ||
                    hasPermissions(Permission.NetworkSync) ||
                    hasPermission(Permission.NetworkProvision)
                  )
                }
              />
            </Dropdown>
          }
          {hasPermission(Permission.NetworkDelete) && (
            <Popconfirm
              placement='left'
              title='确认要删除该设备吗?'
              onConfirm={() => onDelete(record.id, index)}
              okText='删除'
              cancelText='取消'
            >
              <Button type='text' size='small' icon={<DeleteOutlined />} danger />
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  return (
    <Content>
      <PageTitle
        items={[{ title: '网络列表' }]}
        actions={
          <HasPermission value={Permission.NetworkAdd}>
            <Button type={'primary'} onClick={() => setAddVisible(true)}>
              添加网络
              <PlusOutlined />
            </Button>
          </HasPermission>
        }
      />
      <ShadowCard>
        <Row justify={'start'}>
          <Col span={24}>
            <TableLayout
              emptyText={'网络列表为空'}
              permissions={[
                Permission.NetworkEdit,
                Permission.NetworkExport,
                Permission.NetworkDelete
              ]}
              columns={columns}
              dataSource={dataSource}
              onPageChange={(index, size) =>
                setStore((prev) => ({ ...prev, pagedOptions: { index, size } }))
              }
              simple={isMobile}
              scroll={isMobile ? { x: 800 } : undefined}
            />
          </Col>
        </Row>
      </ShadowCard>
      <AddNetworkModal
        visible={addVisible}
        onCancel={() => setAddVisible(false)}
        onSuccess={() => {
          setAddVisible(false);
          if (dataSource) {
            const { size, page, total } = dataSource;
            gotoPage({ size, total, index: page }, 'next');
          }
        }}
      />
      {network && (
        <EditNetworkModal
          visible={editVisible}
          network={network}
          onCancel={() => setEditVisible(false)}
          onSuccess={() => {
            setEditVisible(false);
            fetchNetworks(store);
          }}
        />
      )}
    </Content>
  );
};

export default NetworkPage;
