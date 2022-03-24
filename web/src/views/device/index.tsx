import {
  Button,
  Col,
  Dropdown,
  Input,
  Menu,
  message,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Typography
} from 'antd';
import {
  CaretDownOutlined,
  CodeOutlined,
  DeleteOutlined,
  EditOutlined,
  LoadingOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { Content } from 'antd/lib/layout/layout';
import { useCallback, useEffect, useState } from 'react';
import { DeviceCommand } from '../../types/device_command';
import {
  DeleteDeviceRequest,
  DeviceUpgradeRequest,
  GetDeviceRequest,
  PagingDevicesRequest,
  SendDeviceCommandRequest
} from '../../apis/device';
import { DeviceType } from '../../types/device_type';
import EditSettingModal from './edit/editSettingModal';
import { Device } from '../../types/device';
import EditBaseInfoModel from './edit/editBaseInfoModel';
import Label from '../../components/label';
import ShadowCard from '../../components/shadowCard';
import UpgradeModal from './upgrade';
import '../../string-extension';
import { IsUpgrading } from '../../types/device_upgrade_status';
import '../../assets/iconfont.css';
import AlertIcon from '../../components/alertIcon';
import MyBreadcrumb from '../../components/myBreadcrumb';
import HasPermission from '../../permission';
import usePermission, { Permission } from '../../permission/permission';
import { PageResult } from '../../types/page';
import DeviceTable from '../../components/table/deviceTable';
import NetworkSelect from '../../components/select/networkSelect';
import DeviceUpgradeSpin from './spin/deviceUpgradeSpin';
import './index.css';
import { SingleDeviceStatus } from './SingleDeviceStatus';
import { getValueOfFirstClassProperty, generateDeviceTypeCollections } from './util';
import { isMobile } from '../../utils/deviceDetection';

const { Search } = Input;
const { Option } = Select;
const { Text } = Typography;

const DevicePage = () => {
  const [network, setNetwork] = useState<number>();
  const [searchTarget, setSearchTarget] = useState<number>(0);
  const [searchText, setSearchText] = useState<string>('');
  const [device, setDevice] = useState<Device>();
  const [editSettingVisible, setEditSettingVisible] = useState<boolean>(false);
  const [editBaseInfoVisible, setEditBaseInfoVisible] = useState<boolean>(false);
  const [upgradeVisible, setUpgradeVisible] = useState<boolean>(false);
  const [replaceVisible, setReplaceVisible] = useState<boolean>(false);
  const [executeDevice, setExecuteDevice] = useState<Device>();
  const [dataSource, setDataSource] = useState<PageResult<any>>();
  const { hasPermission, hasPermissions } = usePermission();
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [deviceTypeId, setDeviceTypeId] = useState<number>();

  const onSearch = (value: string) => {
    setSearchText(value);
  };

  const onTargetChange = (value: number) => {
    setSearchTarget(value);
  };

  const fetchDevices = useCallback(
    (current: number, size: number) => {
      const filter: any = {};
      if (searchTarget === 0) {
        filter.name = searchText;
      } else if (searchTarget === 1) {
        filter.mac_address = searchText;
      }
      if (network) {
        filter.network_id = network;
      }
      if (deviceTypeId) {
        filter.type = deviceTypeId;
      }
      PagingDevicesRequest(current, size, filter).then(setDataSource);
    },
    [network, searchText, searchTarget, deviceTypeId]
  );

  useEffect(() => {
    fetchDevices(1, 10);
  }, [fetchDevices]);

  const onRefresh = () => {
    setRefreshKey(refreshKey + 1);
  };

  const onDelete = (id: number) => {
    DeleteDeviceRequest(id).then((_) => onRefresh());
  };

  const onCommand = (device: Device, key: any) => {
    switch (Number(key)) {
      case DeviceCommand.Upgrade:
        setDevice(device);
        setUpgradeVisible(true);
        break;
      case DeviceCommand.CancelUpgrade:
        DeviceUpgradeRequest(device.id, { type: DeviceCommand.CancelUpgrade }).then((res) => {
          if (res.code === 200) {
            message.success('取消升级成功').then();
          } else {
            message.error(`取消升级失败,${res.msg}`).then();
          }
        });
        break;
      default:
        setExecuteDevice(device);
        SendDeviceCommandRequest(device.id, key, {}).then((res) => {
          setExecuteDevice(undefined);
          if (res.code === 200) {
            message.success('命令发送成功').then();
          } else {
            message.error(res.msg).then();
          }
        });
        break;
    }
  };

  const renderCommandMenus = (record: Device) => {
    const disabled = record.state && record.state.isOnline;
    const isUpgrading = record.upgradeStatus && IsUpgrading(record.upgradeStatus.code);
    return (
      <Menu
        onClick={(e) => {
          onCommand(record, e.key);
        }}
      >
        {hasPermission(Permission.DeviceCommand) && (
          <>
            <Menu.Item key={DeviceCommand.Reboot} disabled={!disabled} hidden={isUpgrading}>
              重启
            </Menu.Item>
            <Menu.Item key={DeviceCommand.Reset} disabled={!disabled} hidden={isUpgrading}>
              恢复出厂设置
            </Menu.Item>
          </>
        )}
        {hasPermissions(Permission.DeviceUpgrade, Permission.DeviceFirmwares) && (
          <>
            <Menu.Item key={DeviceCommand.Upgrade} disabled={!disabled} hidden={isUpgrading}>
              固件升级
            </Menu.Item>
            <Menu.Item key={DeviceCommand.CancelUpgrade} hidden={!isUpgrading}>
              取消升级
            </Menu.Item>
          </>
        )}
      </Menu>
    );
  };

  const onEdit = (id: number, key: any) => {
    GetDeviceRequest(id).then((data) => {
      setDevice(data);
      setReplaceVisible(key === '0');
      setEditBaseInfoVisible(key === '1');
      setEditSettingVisible(key === '2');
    });
  };

  const renderEditMenus = (record: Device) => {
    const isUpgrading = record.upgradeStatus && IsUpgrading(record.upgradeStatus.code);
    return (
      <Menu
        onClick={(e) => {
          onEdit(record.id, e.key);
        }}
        disabled={isUpgrading}
      >
        {hasPermission(Permission.DeviceEdit) && <Menu.Item key={1}>编辑设备信息</Menu.Item>}
        {hasPermission(Permission.DeviceSettingsEdit) && record.typeId !== DeviceType.Router && (
          <Menu.Item key={2}>更新设备配置</Menu.Item>
        )}
      </Menu>
    );
  };

  const columns = [
    {
      title: '状态',
      dataIndex: 'state',
      key: 'state',
      render: (state: any, device: Device) => {
        return <SingleDeviceStatus state={state} alertStates={device.alertStates} />;
      }
    },
    {
      title: '设备名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Device) => {
        return (
          <Space>
            <Spin
              indicator={<LoadingOutlined />}
              size={'small'}
              spinning={executeDevice ? executeDevice.id === record.id : false}
            />
            {hasPermission(Permission.DeviceDetail) ? (
              <a href={`#/device-management?locale=devices/deviceDetail&id=${record.id}`}>{text}</a>
            ) : (
              text
            )}
            {record.upgradeStatus && <DeviceUpgradeSpin status={record.upgradeStatus} />}
          </Space>
        );
      }
    },
    {
      title: 'MAC地址',
      dataIndex: 'macAddress',
      key: 'macAddress',
      render: (text: string) => {
        return <Text>{text.toUpperCase().macSeparator()}</Text>;
      }
    },
    {
      title: '设备类型',
      dataIndex: 'typeId',
      key: 'typeId',
      render: (text: DeviceType) => {
        return DeviceType.toString(text);
      }
    },
    {
      title: '数据',
      key: 'data',
      render: (text: any, device: Device) => {
        const {
          properties,
          typeId,
          data: { values }
        } = device;
        const data = getValueOfFirstClassProperty(values, properties, typeId);
        if (typeId === DeviceType.Gateway || typeId === DeviceType.Router) return '-';
        if (data && data.length > 0) {
          return data
            .map((attr: any, index: number) => {
              if (index > 2) return null;
              const field = attr.fields.find((field: any) => field.important);
              return `${attr.name}: ${
                Number.isInteger(field.value) ? field.value : field.value.toFixed(attr.precision)
              }${attr.unit}`;
            })
            .join(', ');
        }
        return '暂无数据';
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (text: any, record: any) => {
        const isUpgrading = record.upgradeStatus && IsUpgrading(record.upgradeStatus.code);
        return (
          <Space>
            <Dropdown overlay={renderEditMenus(record)} trigger={isMobile ? ['click'] : ['hover']}>
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
            <Dropdown
              overlay={renderCommandMenus(record)}
              trigger={isMobile ? ['click'] : ['hover']}
            >
              <Button
                type='text'
                icon={<CodeOutlined />}
                hidden={
                  !(
                    hasPermission(Permission.DeviceCommand) ||
                    hasPermissions(Permission.DeviceUpgrade, Permission.DeviceFirmwares)
                  )
                }
              />
            </Dropdown>
            <HasPermission value={Permission.DeviceDelete}>
              <Popconfirm
                placement='left'
                title='确认要删除该设备吗?'
                onConfirm={() => onDelete(record.id)}
                okText='删除'
                cancelText='取消'
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
      <MyBreadcrumb>
        <Space>
          <Button type={'primary'} href={'#/device-management?locale=devices/addDevice'}>
            添加设备
            <PlusOutlined />
          </Button>
        </Space>
      </MyBreadcrumb>
      <ShadowCard>
        <Row justify='center'>
          <Col span={24}>
            <Space direction={isMobile ? 'vertical' : 'horizontal'}>
              <Label name={'网络'}>
                <NetworkSelect bordered={false} onChange={setNetwork} allowClear />
              </Label>
              <Label name='设备类型'>
                <Select
                  placeholder='请选择设备类型'
                  bordered={false}
                  allowClear={true}
                  onChange={(val) => {
                    setDeviceTypeId(Number.isInteger(val) ? Number(val) : undefined);
                  }}
                >
                  {generateDeviceTypeCollections().map(({ val, name }: any) => (
                    <Select.Option key={val} value={val}>
                      {name}
                    </Select.Option>
                  ))}
                </Select>
              </Label>
              <Input.Group compact>
                <Select
                  defaultValue={searchTarget}
                  style={{ width: '80px' }}
                  onChange={onTargetChange}
                  suffixIcon={<CaretDownOutlined />}
                >
                  <Option value={0}>名称</Option>
                  <Option value={1}>MAC</Option>
                </Select>
                <Search
                  style={{ width: isMobile ? 'calc(100% - 80px)' : '256px' }}
                  placeholder={
                    searchTarget === 0 ? '请输入设备名称进行查询' : '请输入设备MAC进行查询'
                  }
                  onSearch={onSearch}
                  allowClear
                  enterButton
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
              onChange={fetchDevices}
            />
          </Col>
        </Row>
      </ShadowCard>
      <EditBaseInfoModel
        device={device}
        visible={editBaseInfoVisible}
        onSuccess={() => {
          setDevice(undefined);
          setEditBaseInfoVisible(false);
          onRefresh();
        }}
        onCancel={() => {
          setDevice(undefined);
          setEditBaseInfoVisible(false);
        }}
      />
      {device && (
        <EditSettingModal
          device={device}
          visible={editSettingVisible}
          onSuccess={() => {
            setDevice(undefined);
            setEditSettingVisible(false);
            onRefresh();
          }}
          onCancel={() => {
            setDevice(undefined);
            setEditSettingVisible(false);
          }}
        />
      )}
      {device && (
        <UpgradeModal
          visible={upgradeVisible}
          device={device}
          onSuccess={() => {
            setDevice(undefined);
            setUpgradeVisible(false);
          }}
          onCancel={() => {
            setDevice(undefined);
            setUpgradeVisible(false);
          }}
        />
      )}
    </Content>
  );
};

export default DevicePage;
