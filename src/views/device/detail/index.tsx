import React from 'react';
import { useLocation } from 'react-router-dom';
import { Button, Col, Descriptions, DescriptionsProps, Row, Space, Spin, Statistic } from 'antd';
import Icon, { DownloadOutlined, ExportOutlined, WifiOutlined } from '@ant-design/icons';
import { TabsProps } from 'antd/lib';
import intl from 'react-intl-universal';
import { Device } from '../../../types/device';
import SettingPage from './setting';
import { DeviceType } from '../../../types/device_type';
import HasPermission from '../../../permission';
import userPermission, { Permission } from '../../../permission/permission';
import HistoryDataPage from './data';
import useSocket, { SocketTopic } from '../../../socket';
import { RecentHistory } from '../RecentHistory';
import DeviceEvent from './event';
import { CommandDropdown } from '../commandDropdown';
import { SingleDeviceStatus } from '../SingleDeviceStatus';
import InformationCard from './information';
import TopologyView from '../../network/detail/topologyView';
import { RuntimeChart } from '../RuntimeChart';
import { useContext } from '..';
import { Tabs } from '../../../components';
import { toMac } from '../../../utils/format';
import dayjs from '../../../utils/dayjsUtils';
import { SelfLink } from '../../../components/selfLink';
import { ExportNetworkRequest } from '../../../apis/network';
import DownloadModal from './downloadModal';
import { AssetNavigator } from '../navigator';
import { Card } from '../../../components';

const DeviceDetailPage = () => {
  const location = useLocation();
  const { PubSub } = useSocket();
  const { device, network, loading, refresh } = useContext();
  const tabs = useDeviceTabs(device?.typeId);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (device) {
      PubSub.subscribe(SocketTopic.connectionState, (msg: any, state: any) => {
        if (device.macAddress === state.macAddress) {
          // setDevice({ ...device, state: { ...device.state, isOnline: state.isOnline } });
        }
      });
    }
    return () => {
      PubSub.unsubscribe(SocketTopic.upgradeStatus);
      PubSub.unsubscribe(SocketTopic.connectionState);
    };
  }, [device, PubSub]);
  function renderOverview(device: Device) {
    let info = null;
    let bottom = null;
    const { information, macAddress, state, typeId } = device;
    if (DeviceType.isGateway(typeId) && network) {
      const items: DescriptionsProps['items'] = [
        {
          key: 'mac',
          label: intl.get('MAC_ADDRESS'),
          children: toMac(macAddress.toUpperCase())
        },
        {
          key: 'type',
          label: intl.get('TYPE'),
          children: intl.get(DeviceType.toString(device.typeId))
        },
        {
          key: 'version',
          label: intl.get('FIRMWARE_VERSION'),
          children: information.firmware_version ? information.firmware_version : '-'
        },
        {
          key: 'time',
          label: intl.get('LAST_CONNECTION_TIME'),
          children: state.connectedAt
            ? dayjs(state.connectedAt * 1000).format('YYYY-MM-DD HH:mm:ss')
            : '-'
        }
      ];
      if (information.ip_address) {
        items.push({
          key: 'ip',
          label: intl.get('IP_ADDRESS'),
          children: (
            <Space>
              <SelfLink to={`http://${information.ip_address}`} target={'_blank'}>
                {information.ip_address}
              </SelfLink>
            </Space>
          )
        });
      }
      items.push({
        key: 'signal',
        label: intl.get('MOBILE_SIGNAL_STRENGTH'),
        children: state.signalLevel ? `${state.signalLevel} dBm` : '-'
      });
      if (information.iccid_4g) {
        items.push({ key: 'nuber', label: intl.get('4G_CARD_NO'), children: information.iccid_4g });
      }
      bottom = (
        <Row>
          <Col span={16}>
            <Card style={{ marginRight: 12 }}>
              <TopologyView network={network} />
            </Card>
          </Col>
          <Col span={8}>
            <Row gutter={[10, 10]}>
              <Col span={24}>
                <Card title={intl.get('DEVICE_STATUS')}>
                  <Row align='middle'>
                    <Col span={4}>
                      <Icon
                        component={() => <WifiOutlined style={{ fontSize: 30 }} />}
                        width={30}
                        height={30}
                      />
                    </Col>
                    <Col>
                      <Statistic
                        title={intl.get('MOBILE_SIGNAL_STRENGTH')}
                        value={state.signalLevel ?? '-'}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col span={24}>
                <Card title={intl.get('BASIC_INFORMATION')}>
                  <Descriptions column={1} items={items} />
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      );
    } else {
      info = <InformationCard device={device} isLoading={loading} />;
      if (DeviceType.isSensor(typeId)) {
        bottom = <RecentHistory device={device} />;
      }
    }

    return (
      <>
        {info}
        {bottom !== null && <div style={{ marginTop: info !== null ? 16 : 0 }}>{bottom}</div>}
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
        children: device && <SettingPage device={device} onUpdate={refresh} network={network} />
      });
    }
    return tabs;
  }

  return (
    <Spin spinning={loading}>
      {device && (
        <Tabs
          items={tabs}
          tabBarExtraContent={{
            left: (
              <Space style={{ marginRight: 30 }}>
                <AssetNavigator id={device.id} />
                <SingleDeviceStatus alertStates={device.alertStates} state={device.state} />
              </Space>
            ),
            right: (
              <Space style={{ marginLeft: 30 }}>
                {DeviceType.isGateway(device.typeId) && network && (
                  <HasPermission value={Permission.NetworkExport}>
                    <Button
                      type='primary'
                      onClick={() => {
                        ExportNetworkRequest(network.id).then((res) => {
                          const url = window.URL.createObjectURL(new Blob([res.data]));
                          const link = document.createElement('a');
                          link.href = url;
                          link.setAttribute('download', `${network.name}.json`);
                          document.body.appendChild(link);
                          link.click();
                        });
                      }}
                    >
                      {intl.get('EXPORT_NETWORK')}
                      <ExportOutlined />
                    </Button>
                  </HasPermission>
                )}
                {DeviceType.isSensor(device.typeId) && (
                  <HasPermission value={Permission.DeviceData}>
                    <Button type='primary' onClick={() => setOpen(true)}>
                      {intl.get('DOWNLOAD_DATA')}
                      <DownloadOutlined />
                    </Button>
                    <DownloadModal
                      open={open}
                      onCancel={() => setOpen(false)}
                      device={device}
                      onSuccess={() => setOpen(false)}
                    />
                  </HasPermission>
                )}
                <HasPermission value={Permission.DeviceCommand}>
                  <CommandDropdown
                    device={device}
                    initialUpgradeCode={location.state}
                    network={network}
                  />
                </HasPermission>
              </Space>
            )
          }}
          tabsRighted={true}
        />
      )}
    </Spin>
  );
};

export default DeviceDetailPage;
