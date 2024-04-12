import {
  Button,
  Col,
  Dropdown,
  Input,
  MenuProps,
  Popconfirm,
  Row,
  Select,
  Space,
  Typography
} from 'antd';
import {
  CaretDownOutlined,
  CodeOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { Content } from 'antd/lib/layout/layout';
import { useEffect, useState } from 'react';
import { DeleteDeviceRequest, GetDeviceRequest, PagingDevicesRequest } from '../../apis/device';
import { DeviceType } from '../../types/device_type';
import EditSettingModal from './edit/editSettingModal';
import { Device } from '../../types/device';
import EditBaseInfoModel from './edit/editBaseInfoModel';
import Label from '../../components/label';
import ShadowCard from '../../components/shadowCard';
import { IsUpgrading } from '../../types/device_upgrade_status';
import HasPermission from '../../permission';
import usePermission, { Permission } from '../../permission/permission';
import { PageResult } from '../../types/page';
import DeviceTable from '../../components/table/deviceTable';
import NetworkSelect from '../../components/select/networkSelect';
import DeviceUpgradeSpin from './spin/deviceUpgradeSpin';
import { SingleDeviceStatus } from './SingleDeviceStatus';
import { getValueOfFirstClassProperty, omitSpecificKeys } from './util';
import { isMobile } from '../../utils/deviceDetection';
import { Store, useStore } from '../../hooks/store';
import { Normalizes } from '../../constants/validator';
import { PageTitle } from '../../components/pageTitle';
import { SENSORS } from '../../config/assetCategory.config';
import { useAppConfigContext } from '../asset/components/appConfigContext';
import intl from 'react-intl-universal';
import { CommandDropdown } from './commandDropdown';
import { toMac } from '../../utils/format';
import { SelfLink } from '../../components/selfLink';
import { DataBarOfFirstProperties } from './dataBarOfFirstProperties';

const { Search } = Input;
const { Option } = Select;
const { Text } = Typography;

const DevicePage = () => {
  const [device, setDevice] = useState<Device>();
  const [editSettingVisible, setEditSettingVisible] = useState<boolean>(false);
  const [editBaseInfoVisible, setEditBaseInfoVisible] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<PageResult<any>>();
  const { hasPermission } = usePermission();
  const [store, setStore, gotoPage] = useStore('deviceList');
  const config = useAppConfigContext();

  const fetchDevices = (store: Store['deviceList']) => {
    const {
      filters,
      pagedOptions: { index, size }
    } = store;
    PagingDevicesRequest(index, size, omitSpecificKeys(filters ?? {}, [])).then(setDataSource);
  };

  useEffect(() => {
    fetchDevices(store);
  }, [store]);

  const onDelete = (id: number) => {
    DeleteDeviceRequest(id).then((_) => {
      if (dataSource) {
        const { size, page, total } = dataSource;
        gotoPage({ size, total, index: page }, 'prev');
      }
    });
  };

  const onEdit = (id: number, key: any) => {
    GetDeviceRequest(id).then((data) => {
      setDevice(data);
      setEditBaseInfoVisible(key === '1');
      setEditSettingVisible(key === '2');
    });
  };

  const renderEditMenus = (record: Device): MenuProps => {
    const isUpgrading = record.upgradeStatus && IsUpgrading(record.upgradeStatus.code);
    const items: MenuProps['items'] = [];
    if (hasPermission(Permission.DeviceEdit)) {
      items.push({ key: '1', label: intl.get('EDIT_DEVICE_INFO') });
    }
    if (
      hasPermission(Permission.DeviceSettingsEdit) &&
      DeviceType.hasDeviceSettings(record.typeId)
    ) {
      items.push({ key: '2', label: intl.get('EDIT_DEVICE_SETTINGS') });
    }
    return { items, onClick: ({ key }) => onEdit(record.id, key), disabled: isUpgrading };
  };

  const columns = [
    {
      title: intl.get('STATUS'),
      dataIndex: 'state',
      key: 'state',
      render: (state: any, device: Device) => {
        return <SingleDeviceStatus state={state} alertStates={device.alertStates} />;
      }
    },
    {
      title: intl.get('DEVICE_NAME'),
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Device) => {
        return (
          <Space>
            {hasPermission(Permission.DeviceDetail) ? (
              <SelfLink to={`${record.id}`}>{text}</SelfLink>
            ) : (
              text
            )}
            {record.upgradeStatus && <DeviceUpgradeSpin status={record.upgradeStatus} />}
          </Space>
        );
      }
    },
    {
      title: intl.get('MAC_ADDRESS'),
      dataIndex: 'macAddress',
      key: 'macAddress',
      render: (text: string) => {
        return <Text>{toMac(text.toUpperCase())}</Text>;
      }
    },
    {
      title: intl.get('DEVICE_TYPE'),
      dataIndex: 'typeId',
      key: 'typeId',
      render: (text: DeviceType) => {
        return intl.get(DeviceType.toString(text));
      }
    },
    {
      title: intl.get('SIGNAL_STRENGTH_DB'),
      dataIndex: 'state',
      key: 'signalLevel',
      render: (state: any) => {
        return <div>{state ? state.signalLevel : 0}</div>;
      }
    },
    {
      title: intl.get('DATA'),
      key: 'data',
      render: (text: any, device: Device) => {
        if (!DeviceType.isSensor(device.typeId)) return '-';
        const data = getValueOfFirstClassProperty(device);
        if (data && data.length > 0) {
          const channel = device.data?.values?.channel;
          return <DataBarOfFirstProperties data={data} channel={channel} />;
        }
        return intl.get('NO_DATA');
      }
    },
    {
      title: intl.get('OPERATION'),
      key: 'action',
      render: (text: any, record: any) => {
        const isUpgrading = record.upgradeStatus && IsUpgrading(record.upgradeStatus.code);
        return (
          <Space>
            <Dropdown menu={renderEditMenus(record)} trigger={isMobile ? ['click'] : ['hover']}>
              <Button
                type='text'
                size='small'
                icon={<EditOutlined />}
                hidden={
                  !(
                    hasPermission(Permission.DeviceEdit) ||
                    hasPermission(Permission.DeviceSettingsEdit)
                  )
                }
              />
            </Dropdown>
            <HasPermission value={Permission.DeviceCommand}>
              <CommandDropdown
                device={record}
                target={<Button type='text' icon={<CodeOutlined />} />}
              />
            </HasPermission>
            <HasPermission value={Permission.DeviceDelete}>
              <Popconfirm
                placement='left'
                title={intl.get('DELETE_DEVICE_PROMPT')}
                onConfirm={() => onDelete(record.id)}
                okText={intl.get('DELETE')}
                cancelText={intl.get('CANCEL')}
              >
                <Button
                  type='text'
                  size='small'
                  icon={<DeleteOutlined />}
                  danger
                  disabled={isUpgrading}
                />
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
        items={[{ title: intl.get('MENU_DEVICE_LSIT') }]}
        actions={
          <SelfLink to='create'>
            <Button type='primary'>
              {intl.get('CREATE_DEVICE')}
              <PlusOutlined />
            </Button>
          </SelfLink>
        }
      />
      <ShadowCard>
        <Row justify='center'>
          <Col span={24}>
            <Space direction={isMobile ? 'vertical' : 'horizontal'}>
              <Label name={intl.get('NETWORK')}>
                <NetworkSelect
                  bordered={false}
                  onChange={(network) => {
                    setStore((prev) => ({
                      ...prev,
                      pagedOptions: { ...prev.pagedOptions, index: 1 },
                      filters: { ...prev.filters, network_id: network }
                    }));
                  }}
                  allowClear
                  defaultValue={store.filters?.network_id}
                />
              </Label>
              <Label name={intl.get('DEVICE_TYPE')}>
                <Select
                  placeholder={intl.get('PLEASE_SELECT_DEVICE_TYPE')}
                  bordered={false}
                  allowClear={true}
                  onChange={(val) => {
                    setStore((prev) => ({
                      ...prev,
                      pagedOptions: { ...prev.pagedOptions, index: 1 },
                      filters: {
                        ...prev.filters,
                        type: Number.isInteger(val) ? Number(val) : undefined
                      }
                    }));
                  }}
                  defaultValue={store.filters?.type}
                >
                  {DeviceType.getNonSensorDeviceTypes()
                    .concat(SENSORS.get(config) ?? [])
                    .map((d) => {
                      return (
                        <Select.Option key={d} value={d}>
                          {intl.get(DeviceType.toString(d))}
                        </Select.Option>
                      );
                    })}
                </Select>
              </Label>
              <Input.Group compact>
                <Select
                  defaultValue={store.searchTarget}
                  style={{ width: '80px' }}
                  onChange={(val) => setStore((prev) => ({ ...prev, searchTarget: val }))}
                  suffixIcon={<CaretDownOutlined />}
                >
                  <Option value={0}>{intl.get('NAME')}</Option>
                  <Option value={1}>MAC</Option>
                </Select>
                <Search
                  style={{ width: isMobile ? 'calc(100% - 80px)' : '256px' }}
                  placeholder={
                    store.searchTarget === 0
                      ? intl.get('PLEASE_ENTER_DEVICE_NAME_TO_QUERY')
                      : intl.get('PLEASE_ENTER_MAC_TO_QUERY')
                  }
                  onSearch={(val) => {
                    setStore((prev) => ({
                      ...prev,
                      pagedOptions: { ...prev.pagedOptions, index: 1 },
                      filters: {
                        ...prev.filters,
                        name: store.searchTarget === 0 ? val : '',
                        mac_address: store.searchTarget === 0 ? '' : Normalizes.macAddress(val)
                      }
                    }));
                  }}
                  allowClear
                  enterButton
                  defaultValue={store.filters?.mac_address || store.filters?.name}
                />
              </Input.Group>
            </Space>
          </Col>
        </Row>
        <br />
        <Row justify='center'>
          <Col span={24}>
            <DeviceTable
              columns={columns}
              permissions={[
                Permission.DeviceEdit,
                Permission.DeviceSettingsEdit,
                Permission.DeviceCommand,
                Permission.DeviceDelete
              ]}
              dataSource={dataSource}
              onChange={(index: number, size: number) =>
                setStore((prev) => ({ ...prev, pagedOptions: { index, size } }))
              }
            />
          </Col>
        </Row>
      </ShadowCard>
      <EditBaseInfoModel
        device={device}
        open={editBaseInfoVisible}
        onSuccess={() => {
          setDevice(undefined);
          setEditBaseInfoVisible(false);
          fetchDevices(store);
        }}
        onCancel={() => {
          setDevice(undefined);
          setEditBaseInfoVisible(false);
        }}
      />
      {device && (
        <EditSettingModal
          device={device}
          open={editSettingVisible}
          onSuccess={() => {
            setDevice(undefined);
            setEditSettingVisible(false);
            fetchDevices(store);
          }}
          onCancel={() => {
            setDevice(undefined);
            setEditSettingVisible(false);
          }}
        />
      )}
    </Content>
  );
};

export default DevicePage;
