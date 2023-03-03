import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { GetParamValue } from '../../../utils/path';
import { Button, Col, Dropdown, message, Row, Space } from 'antd';
import { Device } from '../../../types/device';
import { GetDeviceRequest } from '../../../apis/device';
import { Content } from 'antd/lib/layout/layout';
import InformationCard from './information';
import ShadowCard from '../../../components/shadowCard';
import { DownOutlined } from '@ant-design/icons';
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
import DeviceEvent from './event';
import { isMobile } from '../../../utils/deviceDetection';
import { FilterableAlarmRecordTable } from '../../../components/alarm/filterableAlarmRecordTable';
import { DynamicData } from './dynamicData';
import { CommandMenu } from '../commandMenu';

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
  const [tabs, setTabs] = useState<any>([]);

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
    if (
      hasPermission(Permission.DeviceRuntimeDataGet) &&
      device.typeId !== DeviceType.BoltElongationMultiChannels
    ) {
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

  return (
    <Content>
      {device && (
        <MyBreadcrumb firstBreadState={location.state}>
          <Space>
            <HasPermission value={Permission.DeviceCommand}>
              <Dropdown
                overlay={<CommandMenu device={device} initialUpgradeCode={location.state} />}
                trigger={isMobile ? ['click'] : ['hover']}
              >
                <Button type={'primary'}>
                  设备命令
                  <DownOutlined />
                </Button>
              </Dropdown>
            </HasPermission>
          </Space>
        </MyBreadcrumb>
      )}
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
    </Content>
  );
};

export default DeviceDetailPage;
