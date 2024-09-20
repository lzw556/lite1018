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
import { useDevicesContext } from '..';
import { TabsProps } from 'antd/lib';
import { SingleDeviceStatus } from '../SingleDeviceStatus';
import InformationCard from './information';
import TopologyView from '../../network/detail/topologyView';
import { Network } from '../../../types/network';
import { GetNetworkRequest } from '../../../apis/network';
import { RuntimeChart } from '../RuntimeChart';
import { VIRTUAL_ROOT_DEVICE } from '../../../constants';
import NetworkPage from '../../network';

const DeviceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { PubSub } = useSocket();
  const [device, setDevice] = useState<Device>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [network, setNetwork] = useState<Network>();
  const tabs = useDeviceTabs(device?.typeId);
  const { setToken } = useDevicesContext();

  const fetchDevice = useCallback(() => {
    if (id && isNumber(Number(id))) {
      if (Number(id) !== VIRTUAL_ROOT_DEVICE.id) {
        setIsLoading(true);
        GetDeviceRequest(Number(id))
          .then((data) => {
            setDevice(data);
            if (DeviceType.isGateway(data.typeId)) {
              if (data.network?.id) {
                GetNetworkRequest(data.network?.id)
                  .then((data) => {
                    setNetwork(data);
                  })
                  .catch((_) => {
                    navigate('/devices');
                  });
              }
            }
            setIsLoading(false);
          })
          .catch((_) => navigate('/devices'));
      }
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

  function renderOverview(device: Device) {
    const info = <InformationCard device={device} isLoading={isLoading} />;
    let bottom = null;
    const { typeId } = device;
    if (DeviceType.isGateway(typeId) && network) {
      bottom = (
        <Card>
          <TopologyView network={network} />
        </Card>
      );
    } else if (DeviceType.isSensor(typeId)) {
      bottom = <RecentHistory device={device} />;
    }

    return (
      <>
        {info}
        {bottom !== null && <div style={{ marginTop: 16 }}>{bottom}</div>}
      </>
    );
  }

  function useDeviceTabs(deviceTypeId?: number) {
    const tabs: TabsProps['items'] = [];
    const { hasPermission, hasPermissions } = userPermission();
    if (deviceTypeId === undefined) return [];
    if (hasPermission(Permission.DeviceData)) {
      tabs.push({
        key: 'overview',
        label: intl.get('OVERVIEW'),
        children: renderOverview(device!)
      });
    }
    if (DeviceType.isSensor(deviceTypeId) && hasPermission(Permission.DeviceData)) {
      tabs.push({
        key: 'historyData',
        label: intl.get('HISTORY_DATA'),
        children: device && <HistoryDataPage device={device} />
      });
    } else if (
      DeviceType.isGateway(deviceTypeId) &&
      hasPermission(Permission.DeviceRuntimeDataGet)
    ) {
      tabs.push({
        key: 'status',
        label: intl.get('STATUS_HISTORY'),
        children: device && <RuntimeChart deviceId={device.id} deviceType={deviceTypeId} />
      });
    }
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

  if (Number(id) === VIRTUAL_ROOT_DEVICE.id) {
    return <NetworkPage />;
  }
  if (isLoading) {
    return <Spin />;
  }
  return (
    <>
      {device && (
        <Card bodyStyle={{ padding: '10px 20px' }}>
          <Tabs
            tabBarExtraContent={{
              left: (
                <div style={{ marginRight: 30 }}>
                  <SingleDeviceStatus alertStates={device.alertStates} state={device.state} />
                  {device.name}
                </div>
              ),
              right: (
                <PageTitle
                  actions={
                    <HasPermission value={Permission.DeviceCommand}>
                      <CommandDropdown device={device} initialUpgradeCode={location.state} />
                    </HasPermission>
                  }
                />
              )
            }}
            items={tabs}
          />
        </Card>
      )}
    </>
  );
};

export default DeviceDetailPage;
