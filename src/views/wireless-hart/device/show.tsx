import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Col, message, Row } from 'antd';
import { Device } from '../../../types/device';
import { GetDeviceRequest } from '../../../apis/device';
import { Content } from 'antd/lib/layout/layout';
import ShadowCard from '../../../components/shadowCard';
import { DeviceType } from '../../../types/device_type';
import HasPermission from '../../../permission';
import userPermission, { Permission } from '../../../permission/permission';
import useSocket, { SocketTopic } from '../../../socket';
import { FilterableAlarmRecordTable } from '../../../components/alarm/filterableAlarmRecordTable';
import { isNumber } from 'lodash';
import { PageTitle } from '../../../components/pageTitle';
import intl from 'react-intl-universal';
import { useLocaleContext } from '../../../localeProvider';
import HistoryDataPage from '../../device/detail/data';
import WaveDataChart from '../../device/detail/waveData';
import { RecentHistory } from '../../device/RecentHistory';
import { RuntimeChart } from '../../device/RuntimeChart';
import DeviceEvent from '../../device/detail/event';
import { DynamicData } from '../../device/detail/dynamicData';
import { CommandDropdown } from '../../device/commandDropdown';
import SettingPage from './settings';
import InformationCard from './information';
import { SelfLink } from '../../../components/selfLink';

const DeviceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLocaleContext();
  const { PubSub } = useSocket();
  const [device, setDevice] = useState<Device>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentKey, setCurrentKey] = useState<string>('');
  const tabs = useDeviceTabs(device?.typeId);

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

  useEffect(() => {
    if (device) {
      PubSub.subscribe(SocketTopic.connectionState, (msg: any, state: any) => {
        if (device.macAddress === state.macAddress) {
          setDevice({ ...device, state: { ...device.state, isOnline: state.isOnline } });
        }
      });
    }
    return () => {
      PubSub.unsubscribe(SocketTopic.upgradeStatus);
      PubSub.unsubscribe(SocketTopic.connectionState);
    };
  }, [device, PubSub]);

  useEffect(() => {
    if (tabs.length > 0 && currentKey === '') {
      setCurrentKey(tabs[0].key);
    }
  }, [tabs, currentKey]);

  return (
    <Content>
      {device && (
        <PageTitle
          items={[
            { title: <SelfLink to='/devices'>{intl.get('MENU_DEVICE_LSIT')}</SelfLink> },
            { title: intl.get('DEVICE_DETAIL') }
          ]}
          actions={
            <HasPermission value={Permission.DeviceCommand}>
              <CommandDropdown device={device} initialUpgradeCode={location.state} />
            </HasPermission>
          }
        />
      )}
      <Row justify='center'>
        <Col span={24}>
          {device && <InformationCard device={device} isLoading={isLoading} />}
          <br />
          {device && tabs.length > 0 && (
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

export function useDeviceTabs(deviceTypeId?: number) {
  const { hasPermission, hasPermissions } = userPermission();
  if (deviceTypeId === undefined) return [];
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
  if (deviceTypeId !== DeviceType.Gateway) {
    if (hasPermission(Permission.DeviceRuntimeDataGet)) {
      tabs.push({ key: 'ta', tab: 'STATUS_HISTORY' });
    }
  }
  switch (deviceTypeId) {
    case DeviceType.VibrationTemperature3Axis:
    case DeviceType.VibrationTemperature3AxisNB:
    case DeviceType.VibrationTemperature3AxisAdvanced:
    case DeviceType.VibrationTemperature3AxisAdvancedNB:
    case DeviceType.VibrationTemperature3AxisWIRED:
    case DeviceType.VibrationTemperature3Axis16G:
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
}
