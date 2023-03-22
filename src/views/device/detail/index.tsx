import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button, Col, Dropdown, message, Row } from 'antd';
import { Device } from '../../../types/device';
import { GetDeviceRequest } from '../../../apis/device';
import { Content } from 'antd/lib/layout/layout';
import InformationCard from './information';
import ShadowCard from '../../../components/shadowCard';
import { DownOutlined } from '@ant-design/icons';
import SettingPage from './setting';
import { DeviceType } from '../../../types/device_type';
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
import { isNumber } from 'lodash';
import { PageTitle } from '../../../components/pageTitle';

import intl from 'react-intl-universal';
import { useLocaleContext } from '../../../localeProvider';

const DeviceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLocaleContext();
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
    ['monitor', device && <RecentHistory device={device} key={language} />],
    ['ta', device && <RuntimeChart deviceId={device.id} deviceType={device.typeId} />],
    ['events', device && <DeviceEvent device={device} />],
    ['alarm', device && <FilterableAlarmRecordTable sourceId={device.id} />],
    ['dynamicData', device && <DynamicData {...device} />]
  ]);

  const fetchDevice = useCallback(() => {
    if (id && isNumber(Number(id))) {
      setIsLoading(true);
      GetDeviceRequest(Number(id))
        .then((data) => {
          setDevice(data);
          setIsLoading(false);
        })
        .catch((_) => navigate('/devices'));
    } else {
      message.error(intl.get('DEVICE_DOES_NOT_EXIST')).then();
      navigate('/devices');
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchDevice();
  }, [fetchDevice]);

  const getDeviceTabs = useCallback((device: Device) => {
    const tabTitleList = [
      {
        key: 'monitor',
        tab: 'MONITOR'
      },
      {
        key: 'historyData',
        tab: 'HISTORY_DATA'
      }
    ];
    let tabs = [];
    if (hasPermission(Permission.DeviceEventList)) {
      tabs.push({ key: 'events', tab: 'EVENTS' });
    }
    if (hasPermissions(Permission.DeviceSettingsGet, Permission.DeviceSettingsEdit)) {
      tabs.push({ key: 'settings', tab: 'SETTINGS' });
    }
    if (hasPermission(Permission.DeviceRuntimeDataGet)) {
      tabs.push({ key: 'ta', tab: 'HISTORY_STATUS' });
    }
    switch (device.typeId) {
      case DeviceType.VibrationTemperature3Axis:
      case DeviceType.VibrationTemperature3AxisNB:
      case DeviceType.VibrationTemperature3AxisAdvanced:
      case DeviceType.VibrationTemperature3AxisAdvancedNB:
        if (hasPermission(Permission.DeviceData)) {
          tabs.unshift(...tabTitleList, { key: 'waveData', tab: 'WAVEFORM_DATA' });
        }
        break;
      case DeviceType.Gateway:
      case DeviceType.Router:
        return tabs;
      case DeviceType.BoltElongation:
      case DeviceType.AngleDip:
      case DeviceType.AngleDipNB:
        if (hasPermission(Permission.DeviceData)) {
          tabs.unshift(...tabTitleList, { key: 'dynamicData', tab: 'DYNAMIC_DATA' });
        }
        break;
      default:
        if (hasPermission(Permission.DeviceData)) {
          tabs.unshift(...tabTitleList);
        }
        break;
    }
    return tabs;
  }, []);

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

  return (
    <Content>
      {device && (
        <PageTitle
          items={[
            { title: <Link to='/devices'>{intl.get('MENU_DEVICE_LSIT')}</Link> },
            { title: intl.get('DEVICE_DETAIL') }
          ]}
          actions={
            <HasPermission value={Permission.DeviceCommand}>
              <Dropdown
                overlay={<CommandMenu device={device} initialUpgradeCode={location.state} />}
                trigger={isMobile ? ['click'] : ['hover']}
              >
                <Button type={'primary'}>
                  {intl.get('DEVICE_COMMANDS')}
                  <DownOutlined />
                </Button>
              </Dropdown>
            </HasPermission>
          }
        />
      )}
      <Row justify='center'>
        <Col span={24}>
          {device && <InformationCard device={device} isLoading={isLoading} />}
          <br />
          {device && (
            <ShadowCard
              size={'small'}
              tabList={tabs.map((tab: any) => ({ ...tab, tab: intl.get(tab.tab) }))}
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
