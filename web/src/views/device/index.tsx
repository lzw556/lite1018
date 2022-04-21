import {
  Button,
  Col,
  Dropdown,
  Input,
  Menu,
  message,
  Modal,
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
import { useEffect, useState } from 'react';
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
import { getValueOfFirstClassProperty, generateDeviceTypeCollections, omitSpecificKeys, Filters } from './util';
import { isMobile } from '../../utils/deviceDetection';
import { Link, useLocation } from 'react-router-dom';
import { PagedOption } from '../../types/props';
import EditCalibrateParas from './edit/editCalibrateParas';
import { AlarmRuleSettings } from './detail/setting/alarmRuleSettings';

const { Search } = Input;
const { Option } = Select;
const { Text } = Typography;
type RememberdState = {filters: Filters; pagedOptions: PagedOption; searchTarget: number;}

const DevicePage = () => {
  const { state } = useLocation<RememberdState>();
  const [searchTarget, setSearchTarget] = useState(state ? state.searchTarget :0);
  const pagedOptionsDefault = { index: 1, size: 10 };
  const [pagedOptions, setPagedOptions] = useState(state ? state.pagedOptions : pagedOptionsDefault);
  const [filters, setFilters] = useState<Filters | undefined>(state ? state.filters: undefined);
  const [device, setDevice] = useState<Device>();
  const [editSettingVisible, setEditSettingVisible] = useState<boolean>(false);
  const [editBaseInfoVisible, setEditBaseInfoVisible] = useState<boolean>(false);
  const [upgradeVisible, setUpgradeVisible] = useState<boolean>(false);
  const [executeDevice, setExecuteDevice] = useState<Device>();
  const [dataSource, setDataSource] = useState<PageResult<any>>();
  const { hasPermission, hasPermissions } = usePermission();
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [visibleCalibrate, setVisibleCalibrate] = useState(false);
  const [visibleAlarmRules, setVisibleAlarmRules] = useState(false);

  useEffect(() => {
    const { index, size } = pagedOptions;
    PagingDevicesRequest(index, size, omitSpecificKeys(filters ?? {}, [])).then(setDataSource);
  }, [pagedOptions, filters, refreshKey]);

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
      case DeviceCommand.Calibrate:
        setDevice(device);
        setVisibleCalibrate(true);
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
            {record.typeId !== DeviceType.Gateway && record.typeId !== DeviceType.Router && (
              <Menu.Item key={DeviceCommand.ResetData} disabled={!disabled} hidden={isUpgrading}>
                重置数据
              </Menu.Item>
            )}
            <Menu.Item key={DeviceCommand.Reset} disabled={!disabled} hidden={isUpgrading}>
              恢复出厂设置
            </Menu.Item>
            {(record.typeId === DeviceType.HighTemperatureCorrosion ||
              record.typeId === DeviceType.NormalTemperatureCorrosion ||
              record.typeId === DeviceType.BoltElongation) && (
              <Menu.Item key={DeviceCommand.Calibrate} disabled={!disabled} hidden={isUpgrading}>
                校准
              </Menu.Item>
            )}
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
      setEditBaseInfoVisible(key === '1');
      setEditSettingVisible(key === '2');
      setVisibleAlarmRules(key === '3');
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
        {record.typeId !== DeviceType.Gateway && record.typeId !== DeviceType.Router && <Menu.Item key={3}>编辑报警规则</Menu.Item>}
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
              <Link
                to={{
                  pathname: `device-management`,
                  search: `?locale=devices/deviceDetail&id=${record.id}`,
                  state: {filters, pagedOptions, searchTarget}
                }}
              >
                {text}
              </Link>
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
      title: '信号强度(dB)',
      dataIndex: 'state',
      key: 'signalLevel',
      render: (state: any) => {
        return <div>{state ? state.signalLevel : 0}</div>;
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
                <NetworkSelect bordered={false} onChange={(network) => {
                  setFilters(prev => ({...prev, network_id: network}));
                  setPagedOptions(pagedOptionsDefault);
                }} allowClear defaultValue={filters?.network_id}/>
              </Label>
              <Label name='设备类型'>
                <Select
                  placeholder='请选择设备类型'
                  bordered={false}
                  allowClear={true}
                  onChange={(val) => {
                    setFilters(prev => ({...prev, type: Number.isInteger(val) ? Number(val) : undefined}));
                    setPagedOptions(pagedOptionsDefault);
                  }}
                  defaultValue={filters?.type}
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
                  onChange={val => setSearchTarget(val)}
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
                  onSearch={val => {
                    setFilters(prev => {
                      return searchTarget === 0 ? {...prev, name: val} : {...prev, mac_address: val}
                    })
                    setPagedOptions(pagedOptionsDefault);
                  }}
                  allowClear
                  enterButton
                  defaultValue={filters?.mac_address || filters?.name}
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
              onChange={(index: number, size: number) => setPagedOptions({ index, size })}
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
      {visibleCalibrate && device && (
        <EditCalibrateParas
          visible={visibleCalibrate}
          setVisible={setVisibleCalibrate}
          typeId={device?.typeId}
          properties={device.properties}
          onUpdate={(paras) => {
            setDevice(undefined);
            setVisibleCalibrate(false);
            SendDeviceCommandRequest(device.id, DeviceCommand.Calibrate, paras).then((res) => {
              setExecuteDevice(undefined);
              if (res.code === 200) {
                message.success('命令发送成功').then();
              } else {
                message.error(res.msg).then();
              }
            });
          }}
        />
      )}
     {visibleAlarmRules && device && (
        <Modal
          title='报警规则'
          visible={visibleAlarmRules}
          onCancel={() => {
            setVisibleAlarmRules(false);
            setDevice(undefined);
          }}
          footer={null}
        >
          <AlarmRuleSettings device={device} />
        </Modal>
      )}
    </Content>
  );
};

export default DevicePage;
