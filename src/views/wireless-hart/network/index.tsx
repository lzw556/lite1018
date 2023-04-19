import { Content } from 'antd/lib/layout/layout';
import { useEffect, useState } from 'react';
import intl from 'react-intl-universal';
import usePermission, { Permission } from '../../../permission/permission';
import { Network } from '../../../types/network';
import { PageResult } from '../../../types/page';
import { Store, useStore } from '../../../hooks/store';
import {
  DeleteNetworkRequest,
  ExportNetworkRequest,
  GetNetworkRequest,
  PagingNetworksRequest
} from '../../../apis/network';
import { Link } from 'react-router-dom';
import { Button, Col, Popconfirm, Row, Space } from 'antd';
import { DeleteOutlined, EditOutlined, ExportOutlined, PlusOutlined } from '@ant-design/icons';
import { PageTitle } from '../../../components/pageTitle';
import HasPermission from '../../../permission';
import ShadowCard from '../../../components/shadowCard';
import TableLayout from '../../layout/TableLayout';
import { isMobile } from '../../../utils/deviceDetection';
import { CreateNetwork } from './create';
import { UpdateNetwork } from './update';

export default function NetworkManage() {
  const { hasPermission } = usePermission();
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

  const onEdit = (id: number) => {
    GetNetworkRequest(id).then((data) => {
      setNetwork(data);
      setEditVisible(true);
    });
  };

  const columns = [
    {
      title: intl.get('NETWORK_NAME'),
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
      title: intl.get('IP_ADDRESS'),
      dataIndex: 'gateway',
      key: 'ipAddress',
      render: (gateway: Network['gateway']) => gateway.ipAddress
    },
    {
      title: intl.get('PORT'),
      dataIndex: 'gateway',
      key: 'ipPort',
      render: (gateway: Network['gateway']) => gateway.ipPort
    },
    {
      title: intl.get('OPERATION'),
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
          {hasPermission(Permission.NetworkExport) && (
            <Button
              type='text'
              size='small'
              icon={<ExportOutlined />}
              onClick={() => exportNetwork(record)}
            />
          )}
          {hasPermission(Permission.NetworkDelete) && (
            <Popconfirm
              placement='left'
              title={intl.get('DELETE_DEVICE_PROMPT')}
              onConfirm={() => onDelete(record.id, index)}
              okText={intl.get('DELETE')}
              cancelText={intl.get('CANCEL')}
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
        items={[{ title: intl.get('MENU_NETWORK_LIST') }]}
        actions={
          <HasPermission value={Permission.NetworkAdd}>
            <Button type={'primary'} onClick={() => setAddVisible(true)}>
              {intl.get('CREATE_SOMETHING', { something: intl.get('NETWORK') })}
              <PlusOutlined />
            </Button>
          </HasPermission>
        }
      />
      <ShadowCard>
        <Row justify={'start'}>
          <Col span={24}>
            <TableLayout
              emptyText={intl.get('NO_NETWORKS_PROMPT')}
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
      {addVisible && (
        <CreateNetwork
          open={addVisible}
          onCancel={() => setAddVisible(false)}
          onSuccess={() => {
            setAddVisible(false);
            if (dataSource) {
              const { size, page, total } = dataSource;
              gotoPage({ size, total, index: page }, 'next');
            }
          }}
        />
      )}
      {network && editVisible && (
        <UpdateNetwork
          open={editVisible}
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
}
