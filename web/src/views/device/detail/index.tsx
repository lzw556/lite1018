import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { GetParamValue } from '../../../utils/path';
import { Button, Col, Dropdown, Menu, message, Row, Space } from 'antd';
import { Device } from '../../../types/device';
import {
  DeviceUpgradeRequest,
  GetDeviceRequest,
  SendDeviceCommandRequest
} from '../../../apis/device';
import { Content } from 'antd/lib/layout/layout';
import InformationCard from './information';
import ShadowCard from '../../../components/shadowCard';
import { DownOutlined } from '@ant-design/icons';
import { DeviceCommand } from '../../../types/device_command';
import SettingPage from './setting';
import { DeviceType } from '../../../types/device_type';
import MyBreadcrumb from '../../../components/myBreadcrumb';
import HasPermission from '../../../permission';
import userPermission, { Permission } from '../../../permission/permission';
import HistoryDataPage from './data';
import WaveDataChart from './waveData';
import useSocket, { SocketTopic } from '../../../socket';
import { RecentHistory } from '../RecentHistory';
import { RuntimeChart } from '../RuntimeChart';
import { IsUpgrading } from '../../../types/device_upgrade_status';
import UpgradeModal from '../upgrade';
import DeviceEvent from './event';
import { isMobile } from '../../../utils/deviceDetection';
import { FilterableAlarmRecordTable } from '../../../components/alarm/filterableAlarmRecordTable';
import { DynamicData } from './dynamicData';
import EditCalibrateParas from '../edit/editCalibrateParas';

const tabTitleList = [
  {
    key: 'monitor',
    tab: '监控'
  },
  {
    key: 'historyData',
    tab: '历史数据'
  }
];

const DeviceDetailPage = () => {
  const location = useLocation<any>();
  const { PubSub } = useSocket();
  const [device, setDevice] = useState<Device>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentKey, setCurrentKey] = useState<string>('');
  const { hasPermission, hasPermissions } = userPermission();
  const [upgradeVisible, setUpgradeVisible] = useState<boolean>(false);
  const [upgradeStatus, setUpgradeStatus] = useState<any>();
  const [tabs, setTabs] = useState<any>([]);
  const [visibleCalibrate, setVisibleCalibrate] = useState(false);

  const contents = new Map<string, any>([
    [
      'settings',
      device && (
        <SettingPage
          device={device}
          onUpdate={() => {
            if (device) fetchDevice();
          }}
        />
      )
    ],
    ['historyData', device && <HistoryDataPage device={device} />],
    ['waveData', device && <WaveDataChart device={device} />],
    ['monitor', device && <RecentHistory device={device} />],
    ['ta', device && <RuntimeChart deviceId={device.id} deviceType={device.typeId} />],
    ['events', device && <DeviceEvent device={device} />],
    ['alarm', device && <FilterableAlarmRecordTable sourceId={device.id} />],
    ['dynamicData', device && <DynamicData {...device} />]
  ]);

  const fetchDevice = useCallback(() => {
    const id = GetParamValue(location.search, 'id');
    if (id && !!Number(id)) {
      setIsLoading(true);
      GetDeviceRequest(Number(id))
        .then((data) => {
          setDevice(data);
          setIsLoading(false);
        })
        .catch((_) => (window.location.hash = '/device-management?locale=devices'));
    } else {
      message.error('设备不存在').then();
      window.location.hash = '/device-management?locale=devices';
    }
  }, []);

  useEffect(() => {
    fetchDevice();
  }, [fetchDevice]);

  useEffect(() => {
    if (device) {
      PubSub.subscribe(SocketTopic.connectionState, (msg: any, state: any) => {
        if (device.macAddress === state.macAddress) {
          setDevice({ ...device, state: { ...device.state, isOnline: state.isOnline } });
        }
      });
      PubSub.subscribe(SocketTopic.upgradeStatus, (msg: string, status: any) => {
        if (device.macAddress === status.macAddress) {
          setUpgradeStatus({ code: status.code, progress: status.progress });
        }
      });
      const tabList = getDeviceTabs(device);
      setTabs(tabList);
      if (tabList.length > 0 && !currentKey) {
        setCurrentKey(tabList[0].key);
      }
    }
    return () => {
      PubSub.unsubscribe(SocketTopic.upgradeStatus);
      PubSub.unsubscribe(SocketTopic.connectionState);
    };
  }, [device]);

  const getDeviceTabs = (device: Device) => {
    let tabs = [];
    if (hasPermission(Permission.DeviceEventList)) {
      tabs.push({ key: 'events', tab: '事件' });
    }
    if (hasPermissions(Permission.DeviceSettingsGet, Permission.DeviceSettingsEdit)) {
      tabs.push({ key: 'settings', tab: '配置信息' });
    }
    if (hasPermission(Permission.DeviceRuntimeDataGet)) {
      tabs.push({ key: 'ta', tab: '状态历史' });
    }
    switch (device.typeId) {
      case DeviceType.VibrationTemperature3Axis:
      case DeviceType.VibrationTemperature3AxisNB:
      case DeviceType.VibrationTemperature3AxisAdvanced:
      case DeviceType.VibrationTemperature3AxisAdvancedNB:
        if (hasPermission(Permission.DeviceData)) {
          tabs.unshift(...tabTitleList, { key: 'waveData', tab: '波形数据' });
        }
        break;
      case DeviceType.Gateway:
      case DeviceType.Router:
        return tabs;
      case DeviceType.BoltElongation:
      case DeviceType.AngleDip:
      case DeviceType.AngleDipNB:
        if (hasPermission(Permission.DeviceData)) {
          tabs.unshift(...tabTitleList, { key: 'dynamicData', tab: '动态数据' });
        }
        break;
      default:
        if (hasPermission(Permission.DeviceData)) {
          tabs.unshift(...tabTitleList);
        }
        break;
    }
    return tabs;
  };

  const onCommand = ({ key }: any) => {
    if (device) {
      let commandKey = Number(key);
      let channel = undefined;
      if (Number.isNaN(commandKey)) {
        try {
          const commands: [number, number] = JSON.parse(key);
          commandKey = commands[0];
          channel = commands[1];
        } catch (error) {}
      }
      switch (commandKey) {
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
          SendDeviceCommandRequest(device.id, commandKey, channel ? { channel } : {}).then(
            (res) => {
              if (res.code === 200) {
                message.success('发送成功').then();
              } else {
                message.error('发送失败').then();
              }
            }
          );
          break;
      }
    }
  };

  const renderCommandMenu = () => {
    const isOnline = device && device.state.isOnline;
    const isUpgrading = device && upgradeStatus && IsUpgrading(upgradeStatus.code);
    return (
      <Menu onClick={onCommand}>
        <Menu.Item key={DeviceCommand.Reboot} disabled={!isOnline} hidden={isUpgrading}>
          重启
        </Menu.Item>
        {device && device.typeId !== DeviceType.Router && device.typeId !== DeviceType.Gateway && (
          <>
            <Menu.Item
              key={DeviceCommand.AcquireSensorData}
              disabled={!isOnline}
              hidden={isUpgrading}
            >
              采集数据
            </Menu.Item>

            {device.typeId === DeviceType.BoltElongationMultiChannels ? (
              <Menu.SubMenu title='重置数据'>
                <Menu.Item
                  key={`[${DeviceCommand.ResetData},1]`}
                  disabled={!isOnline}
                  hidden={isUpgrading}
                >
                  1
                </Menu.Item>
                <Menu.Item
                  key={`[${DeviceCommand.ResetData},2]`}
                  disabled={!isOnline}
                  hidden={isUpgrading}
                >
                  2
                </Menu.Item>
                <Menu.Item
                  key={`[${DeviceCommand.ResetData},3]`}
                  disabled={!isOnline}
                  hidden={isUpgrading}
                >
                  3
                </Menu.Item>
                <Menu.Item
                  key={`[${DeviceCommand.ResetData},4]`}
                  disabled={!isOnline}
                  hidden={isUpgrading}
                >
                  4
                </Menu.Item>
              </Menu.SubMenu>
            ) : (
              <Menu.Item key={DeviceCommand.ResetData} disabled={!isOnline} hidden={isUpgrading}>
                重置数据
              </Menu.Item>
            )}
          </>
        )}
        <Menu.Item key={DeviceCommand.Reset} disabled={!isOnline} hidden={isUpgrading}>
          恢复出厂设置
        </Menu.Item>
        {device &&
          (device.typeId === DeviceType.HighTemperatureCorrosion ||
            device.typeId === DeviceType.NormalTemperatureCorrosion ||
            device.typeId === DeviceType.BoltElongation ||
            device.typeId === DeviceType.BoltElongationMultiChannels ||
            device.typeId === DeviceType.PressureTemperature) && (
            <Menu.Item key={DeviceCommand.Calibrate} disabled={!isOnline} hidden={isUpgrading}>
              校准
            </Menu.Item>
          )}
        {hasPermissions(Permission.DeviceUpgrade, Permission.DeviceFirmwares) && (
          <>
            <Menu.Item key={DeviceCommand.Upgrade} disabled={!isOnline} hidden={isUpgrading}>
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

  return (
    <Content>
      <MyBreadcrumb firstBreadState={location.state}>
        <Space>
          <HasPermission value={Permission.DeviceCommand}>
            <Dropdown overlay={renderCommandMenu} trigger={isMobile ? ['click'] : ['hover']}>
              <Button type={'primary'}>
                设备命令
                <DownOutlined />
              </Button>
            </Dropdown>
          </HasPermission>
        </Space>
      </MyBreadcrumb>
      <Row justify='center'>
        <Col span={24}>
          {device && <InformationCard device={device} isLoading={isLoading} />}
          <br />
          {device && (
            <ShadowCard
              size={'small'}
              tabList={tabs}
              onTabChange={(key) => {
                setCurrentKey(key);
              }}
            >
              {currentKey && contents.get(currentKey)}
            </ShadowCard>
          )}
        </Col>
      </Row>
      {device && (
        <UpgradeModal
          visible={upgradeVisible}
          device={device}
          onSuccess={() => {
            setUpgradeVisible(false);
          }}
          onCancel={() => {
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
            setVisibleCalibrate(false);
            SendDeviceCommandRequest(device.id, DeviceCommand.Calibrate, paras).then((res) => {
              if (res.code === 200) {
                message.success('命令发送成功').then();
              } else {
                message.error(res.msg).then();
              }
            });
          }}
        />
      )}
    </Content>
  );
};

export default DeviceDetailPage;
