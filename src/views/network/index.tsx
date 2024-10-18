import { useEffect, useState } from 'react';
import {
  DeleteNetworkRequest,
  ExportNetworkRequest,
  GetNetworkRequest,
  PagingNetworksRequest,
  NetworkSyncRequest,
  NetworkProvisionRequest
} from '../../apis/network';
import TableLayout from '../layout/TableLayout';
import AddNetworkModal from './modal/addNetworkModal';
import { Button, Col, Dropdown, MenuProps, message, Popconfirm, Row, Space } from 'antd';
import {
  CodeOutlined,
  DeleteOutlined,
  EditOutlined,
  ImportOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { Network, NetworkProvisioningMode } from '../../types/network';
import EditNetworkModal from './modal/editNetworkModal';
import dayjs from '../../utils/dayjsUtils';
import { PageResult } from '../../types/page';
import usePermission, { Permission } from '../../permission/permission';
import HasPermission from '../../permission';
import { isMobile } from '../../utils/deviceDetection';
import { Store, useStore } from '../../hooks/store';
import intl from 'react-intl-universal';
import { SelfLink } from '../../components/selfLink';
import AddLoraNetworkModal from './lora/addNetworkModal';
import EditLoraNetworkModal from './lora/editNetworkModal';
import { DeviceType } from '../../types/device_type';
import { useContext, VIRTUAL_ROOT_DEVICE } from '../device';
import { Card } from '../../components';

const NetworkPage = () => {
  const { hasPermission, hasPermissions } = usePermission();
  const [addVisible, setAddVisible] = useState<boolean>(false);
  const [addLoraVisible, setAddLoraVisible] = useState<boolean>(false);
  const [editVisible, setEditVisible] = useState<boolean>(false);
  const [network, setNetwork] = useState<Network>();
  const [dataSource, setDataSource] = useState<PageResult<any>>();
  const [store, setStore, gotoPage] = useStore('networkList');
  const [deviceListStore, setDeviceListStore] = useStore('deviceList');
  const devicesContext = useContext();

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
      devicesContext.refresh(true);
    });
  };

  const onCommand = (record: Network, key: any) => {
    switch (key) {
      case '0':
        NetworkSyncRequest(record.id).then((res) => {
          if (res.code === 200) {
            message.success(intl.get('SENT_SUCCESSFUL'));
          } else {
            message.error(`${intl.get('FAILED_TO_SEND')}${intl.get(res.msg).d(res.msg)}`);
          }
        });
        break;
      case '1':
        NetworkProvisionRequest(record.id).then((res) => {
          if (res.code === 200) {
            message.success(intl.get('SENT_SUCCESSFUL'));
          } else {
            message.error(`${intl.get('FAILED_TO_SEND')}${intl.get(res.msg).d(res.msg)}`);
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

  const renderCommandMenus = () => {
    const items: MenuProps['items'] = [];
    if (hasPermission(Permission.NetworkSync)) {
      items.push({ key: '0', label: intl.get('SYNC_NETWORK') });
    }
    if (hasPermission(Permission.NetworkProvision)) {
      items.push({ key: '1', label: intl.get('PROVISION') });
    }
    if (hasPermission(Permission.NetworkExport)) {
      items.push({ key: '2', label: intl.get('EXPORT_NETWORK') });
    }
    return items;
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
          return <SelfLink to={`/devices/${record.gateway.id}`}>{text}</SelfLink>;
        }
        return text;
      }
    },
    {
      title: intl.get('MODE'),
      dataIndex: 'mode',
      key: 'mode',
      render: (mode: number, r: Network) => {
        return r && r.gateway.typeId === DeviceType.Gateway
          ? NetworkProvisioningMode.toString(mode)
          : '-';
      }
    },
    {
      title: intl.get('COMMUNICATION_PERIOD'),
      dataIndex: 'communicationPeriod',
      key: 'communicationPeriod',
      render: (text: number, record: Network) => {
        return dayjs.duration(text / 1000, 'seconds').humanize();
      }
    },
    {
      title: intl.get('COMMUNICATION_OFFSET'),
      dataIndex: 'communicationOffset',
      key: 'communicationOffset',
      render: (text: number, record: Network) => {
        if (text === 0) {
          return intl.get('NONE');
        }
        if (text / 1000 < 60 || (text / 1000) % 60 !== 0) {
          return intl.get('SECOND_OPTION', { value: text / 1000 });
        }
        return dayjs.duration(text / 1000, 'seconds').humanize();
      }
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
          {
            <Dropdown
              menu={{
                items: renderCommandMenus(),
                onClick: ({ key }) => {
                  onCommand(record, key);
                }
              }}
            >
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
    <>
      <Card
        title={VIRTUAL_ROOT_DEVICE.name}
        extra={
          <Space>
            <HasPermission value={Permission.NetworkAdd}>
              <Dropdown.Button
                type='primary'
                onClick={() => setAddVisible(true)}
                menu={{
                  items: [
                    {
                      label: intl.get('CREATE_SOMETHING', {
                        something: intl.get('DEVICE_TYPE_GATEWAY_LORA')
                      }),
                      key: 'lora'
                    }
                  ],
                  onClick: (e) => {
                    if (e.key === 'lora') {
                      setAddLoraVisible(true);
                    }
                  }
                }}
              >
                {intl.get('CREATE_SOMETHING', { something: intl.get('NETWORK') })}
              </Dropdown.Button>
            </HasPermission>
            <HasPermission value={Permission.NetworkAdd}>
              <SelfLink to='/devices/import'>
                <Button type='primary'>
                  {intl.get('MENU_IMPORT_NETWORK')}
                  <ImportOutlined />
                </Button>
              </SelfLink>
            </HasPermission>
            <SelfLink to='/devices/create'>
              <Button type='primary'>
                {intl.get('CREATE_SOMETHING', { something: intl.get('DEVICE') })}
                <PlusOutlined />
              </Button>
            </SelfLink>
          </Space>
        }
      >
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
      </Card>
      {addVisible && (
        <AddNetworkModal
          open={addVisible}
          onCancel={() => setAddVisible(false)}
          onSuccess={() => {
            setAddVisible(false);
            if (dataSource) {
              const { size, page, total } = dataSource;
              gotoPage({ size, total, index: page }, 'next');
            }
            devicesContext.refresh(true);
          }}
        />
      )}
      {network && network.gateway.typeId === DeviceType.Gateway && editVisible && (
        <EditNetworkModal
          open={editVisible}
          network={network}
          onCancel={() => setEditVisible(false)}
          onSuccess={() => {
            setEditVisible(false);
            message.success(intl.get('SAVED_SUCCESSFUL'));
            fetchNetworks(store);
            devicesContext.refresh(true);
          }}
        />
      )}
      {addLoraVisible && (
        <AddLoraNetworkModal
          open={addLoraVisible}
          onCancel={() => setAddLoraVisible(false)}
          onSuccess={() => {
            setAddLoraVisible(false);
            if (dataSource) {
              const { size, page, total } = dataSource;
              gotoPage({ size, total, index: page }, 'next');
            }
            devicesContext.refresh(true);
          }}
        />
      )}
      {network && network.gateway.typeId === DeviceType.GatewayLora && editVisible && (
        <EditLoraNetworkModal
          open={editVisible}
          network={network}
          onCancel={() => setEditVisible(false)}
          onSuccess={() => {
            setEditVisible(false);
            message.success(intl.get('SAVED_SUCCESSFUL'));
            fetchNetworks(store);
          }}
        />
      )}
      {/* {importingOpen && (
        <ModalWrapper open={importingOpen} onCancel={() => setImportingOpen(false)}>
          <ImportNetworkPage />
        </ModalWrapper>
      )} */}
    </>
  );
};

export default NetworkPage;
