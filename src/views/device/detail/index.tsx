import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Card, message, Spin, Tabs } from 'antd';
import { Device } from '../../../types/device';
import { GetDeviceRequest } from '../../../apis/device';
import SettingPage from './setting';
import { DeviceType } from '../../../types/device_type';
import HasPermission from '../../../permission';
import userPermission, { Permission } from '../../../permission/permission';
import HistoryDataPage from './data';
import useSocket, { SocketTopic } from '../../../socket';
import { RecentHistory } from '../RecentHistory';
import DeviceEvent from './event';
import { CommandDropdown } from '../commandDropdown';
import { isNumber } from 'lodash';
import { PageTitle } from '../../../components/pageTitle';
import intl from 'react-intl-universal';
import { useLocaleContext } from '../../../localeProvider';
import { useDevicesContext } from '..';
import { TabsProps } from 'antd/lib';

const DeviceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLocaleContext();
  const { PubSub } = useSocket();
  const [device, setDevice] = useState<Device>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const tabs = useDeviceTabs(device?.typeId);
  const { setToken } = useDevicesContext();

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

  function useDeviceTabs(deviceTypeId?: number) {
    const commonTabs = useCommonTabs();
    const sensorTabs = useSensorTabs();
    if (deviceTypeId === undefined) return [];
    if (DeviceType.isSensor(deviceTypeId)) {
      if (DeviceType.isWiredSensor(deviceTypeId)) {
        return [...sensorTabs, ...commonTabs.filter((t, i) => i + 1 < commonTabs.length)];
      }
      return [...sensorTabs, ...commonTabs];
    } else {
      return commonTabs;
    }
  }

  function useCommonTabs() {
    const tabs: TabsProps['items'] = [];
    const { hasPermission, hasPermissions } = userPermission();
    if (hasPermission(Permission.DeviceEventList)) {
      tabs.push({
        key: 'events',
        label: intl.get('EVENTS'),
        children: device && <DeviceEvent device={device} />
      });
    }
    if (hasPermissions(Permission.DeviceSettingsGet, Permission.DeviceSettingsEdit)) {
      tabs.push({
        key: 'settings',
        label: intl.get('SETTINGS'),
        children: device && (
          <SettingPage
            device={device}
            onUpdate={() => {
              setToken((crt) => crt + 1);
            }}
          />
        )
      });
    }
    return tabs;
  }

  function useSensorTabs() {
    const tabs: TabsProps['items'] = [];
    const { hasPermission } = userPermission();
    if (hasPermission(Permission.DeviceData)) {
      tabs.push(
        ...[
          {
            key: 'overview',
            label: intl.get('OVERVIEW'),
            children: device && (
              <RecentHistory device={device} key={language} isLoading={isLoading} />
            )
          },
          {
            key: 'historyData',
            label: intl.get('HISTORY_DATA'),
            children: device && <HistoryDataPage device={device} />
          }
        ]
      );
    }
    return tabs;
  }

  if (isLoading) {
    return <Spin />;
  }
  return (
    <>
      {device && (
        <Card bodyStyle={{ padding: '10px 20px' }}>
          <Tabs
            tabBarExtraContent={
              <PageTitle
                actions={
                  <HasPermission value={Permission.DeviceCommand}>
                    <CommandDropdown device={device} initialUpgradeCode={location.state} />
                  </HasPermission>
                }
              />
            }
            items={tabs}
          />
        </Card>
      )}
    </>
  );
};

export default DeviceDetailPage;
