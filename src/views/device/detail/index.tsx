import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Col, message, Row } from 'antd';
import { Device } from '../../../types/device';
import { GetDeviceRequest } from '../../../apis/device';
import { Content } from 'antd/lib/layout/layout';
import InformationCard from './information';
import ShadowCard from '../../../components/shadowCard';
import SettingPage from './setting';
import { DeviceType } from '../../../types/device_type';
import HasPermission from '../../../permission';
import userPermission, { Permission } from '../../../permission/permission';
import HistoryDataPage from './data';
import useSocket, { SocketTopic } from '../../../socket';
import { RecentHistory } from '../RecentHistory';
import { RuntimeChart } from '../RuntimeChart';
import DeviceEvent from './event';
import { FilterableAlarmRecordTable } from '../../../components/alarm/filterableAlarmRecordTable';
import { CommandDropdown } from '../commandDropdown';
import { isNumber } from 'lodash';
import { PageTitle } from '../../../components/pageTitle';
import intl from 'react-intl-universal';
import { useLocaleContext } from '../../../localeProvider';
import { useDevicesContext } from '..';

const DeviceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLocaleContext();
  const { PubSub } = useSocket();
  const [device, setDevice] = useState<Device>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentKey, setCurrentKey] = useState<string>();
  const tabs = useDeviceTabs(device?.typeId);
  const { setToken } = useDevicesContext();

  const contents = new Map<string, any>([
    [
      'settings',
      device && (
        <SettingPage
          device={device}
          onUpdate={() => {
            setToken((crt) => crt + 1);
          }}
        />
      )
    ],
    ['historyData', device && <HistoryDataPage device={device} />],
    ['monitor', device && <RecentHistory device={device} key={language} />],
    ['ta', device && <RuntimeChart deviceId={device.id} deviceType={device.typeId} />],
    ['events', device && <DeviceEvent device={device} />],
    ['alarm', device && <FilterableAlarmRecordTable sourceId={device.id} />]
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

  return (
    <Content>
      {device && (
        <PageTitle
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
              tabList={tabs.map((tab: any) => ({ ...tab, tab: intl.get(tab.tab) }))}
              defaultActiveTabKey={tabs[0].key}
              onTabChange={(key) => {
                setCurrentKey(key);
              }}
            >
              {currentKey ? contents.get(currentKey) : contents.get(tabs[0].key)}
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
  if (hasPermission(Permission.DeviceRuntimeDataGet) && !DeviceType.isWiredSensor(deviceTypeId)) {
    tabs.push({ key: 'ta', tab: 'STATUS_HISTORY' });
  }
  switch (deviceTypeId) {
    case DeviceType.Gateway:
    case DeviceType.Router:
      return tabs;
    default:
      if (hasPermission(Permission.DeviceData)) {
        tabs.unshift(...tabTitleList);
      }
      break;
  }
  return tabs;
}
