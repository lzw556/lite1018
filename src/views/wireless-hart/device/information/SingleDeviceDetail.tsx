import { Space, Typography } from 'antd';
import dayjs from '../../../../utils/dayjsUtils';
import * as React from 'react';
import { Device } from '../../../../types/device';
import { DeviceType } from '../../../../types/device_type';
import intl from 'react-intl-universal';
import { getDisplayName, toMac } from '../../../../utils/format';
import { NameValueGroups } from '../../../../components/name-values';
import DeviceUpgradeSpin from '../../../device/spin/deviceUpgradeSpin';
import { SingleDeviceStatus } from '../../../device/SingleDeviceStatus';
import { SelfLink } from '../../../../components/selfLink';
import { useLocaleContext } from '../../../../localeProvider';

const { Text } = Typography;

export const SingleDeviceDetail: React.FC<{ device: Device; upgradeStatus: any }> = ({
  device,
  upgradeStatus
}) => {
  const { language } = useLocaleContext();
  const items = [
    {
      name: intl.get('DEVICE_NAME'),
      value: (
        <Space>
          {device.name}
          {upgradeStatus && <DeviceUpgradeSpin status={upgradeStatus} />}
        </Space>
      )
    },
    {
      name: intl.get('TYPE'),
      value: intl.get(DeviceType.toString(device.typeId))
    }
  ];
  if (!DeviceType.isGateway(device.typeId)) {
    items.push({
      name: intl.get('MAC_ADDRESS'),
      value: (
        <Text
          copyable={{
            text: device.macAddress,
            tooltips: [intl.get('COPY'), intl.get('COPY_SUCCEEDED')]
          }}
        >
          {toMac(device.macAddress.toUpperCase())}
        </Text>
      )
    });
    items.push({
      name: intl.get('DEVICE_TAG'),
      value: device.tag ?? '-'
    });
  } else {
    items.push({
      name: intl.get('IP_ADDRESS'),
      value: device.ipAddress ?? '-'
    });
    items.push({
      name: intl.get('PORT'),
      value: device.ipPort.toString() ?? '-'
    });
  }
  if (!DeviceType.isGateway(device.typeId)) {
    items.push({
      name: intl.get('MODEL'),
      value: device.information.model ? device.information.model : '-'
    });
  }
  items.push({
    name: intl.get('STATUS'),
    value: <SingleDeviceStatus alertStates={device.alertStates} state={device.state} />
  });
  if (device.state && !DeviceType.isRootDevice(device.typeId)) {
    items.push({
      name: intl.get('NETWORK_BELONG_TO'),
      value: device.network ? device.network.name : intl.get('NONE')
    });
  }
  if (!DeviceType.isWiredDevice(device.typeId)) {
    items.push({
      name: getDisplayName({ name: intl.get('BATTERY_VOLTAGE'), lang: language, suffix: 'mV' }),
      value: device.state ? device.state.batteryVoltage : '-'
    });
  }
  if (!DeviceType.isGateway(device.typeId)) {
    items.push({
      name: getDisplayName({ name: intl.get('SIGNAL_STRENGTH'), lang: language, suffix: 'dBm' }),
      value: device.state ? device.state.signalLevel : '-'
    });
    items.push({
      name: intl.get('FIRMWARE_VERSION'),
      value: device.information.firmware_version ? device.information.firmware_version : '-'
    });
  }
  items.push({
    name: intl.get('LAST_CONNECTION_TIME'),
    value: device.state.connectedAt
      ? dayjs(device.state.connectedAt * 1000).format('YYYY-MM-DD HH:mm:ss')
      : '-'
  });
  if (!DeviceType.isGateway(device.typeId)) {
    items.push({
      name: intl.get('PRODUCT_ID'),
      value: device.information.product_id ? device.information.product_id : '-'
    });
  }
  if (DeviceType.isSensor(device.typeId)) {
    items.push({
      name: intl.get('LAST_SAMPLING_TIME'),
      value:
        device.data && device.data.timestamp && device.data.timestamp > 0
          ? dayjs.unix(device.data.timestamp).local().format('YYYY-MM-DD HH:mm:ss')
          : '-'
    });
  }
  if (device.information.iccid_4g) {
    items.push({ name: intl.get('4G_CARD_NO'), value: device.information.iccid_4g });
  } else if (device.information.ip_address) {
    items.push({
      name: intl.get('IP_ADDRESS'),
      value: (
        <Space>
          {device.information.ip_address}{' '}
          <SelfLink to={`http://${device.information.ip_address}`} target={'_blank'}>
            {intl.get('GO_TO_ADMIN_PORTAL')}
          </SelfLink>
        </Space>
      )
    });
  }
  return <NameValueGroups items={items} divider={40} col={{ xxl: 8, xl: 12, lg: 12, md: 12 }} />;
};
