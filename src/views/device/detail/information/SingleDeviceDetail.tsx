import { Space, Typography } from 'antd';
import dayjs from '../../../../utils/dayjsUtils';
import * as React from 'react';
import { Device } from '../../../../types/device';
import { DeviceType } from '../../../../types/device_type';
import { SingleDeviceStatus } from '../../SingleDeviceStatus';
import DeviceUpgradeSpin from '../../spin/deviceUpgradeSpin';
import intl from 'react-intl-universal';
import { Link } from 'react-router-dom';
import { toMac } from '../../../../utils/format';
import { NameValueGroups } from '../../../../components/name-values';

const { Text } = Typography;

export const SingleDeviceDetail: React.FC<{ device: Device; upgradeStatus: any }> = ({
  device,
  upgradeStatus
}) => {
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
    },
    {
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
    },
    {
      name: intl.get('MODEL'),
      value: device.information.model ? device.information.model : '-'
    },
    {
      name: intl.get('STATUS'),
      value: <SingleDeviceStatus alertStates={device.alertStates} state={device.state} />
    }
  ];
  if (device.state && !DeviceType.isMultiChannel(device.typeId)) {
    items.push({
      name: intl.get('NETWORK_BELONG_TO'),
      value: device.network ? device.network.name : intl.get('NONE')
    });
    if (device.typeId !== DeviceType.Gateway) {
      items.push({
        name: `${intl.get('BATTERY_VOLTAGE')}(mV)`,
        value: device.state ? device.state.batteryVoltage : '-'
      });
    }
  }
  items.push({
    name: `${intl.get('SIGNAL_STRENGTH')}(dB)`,
    value: device.state ? device.state.signalLevel : '-'
  });
  items.push({
    name: intl.get('HARDWARE_VERSION'),
    value: device.information.firmware_version ? device.information.firmware_version : '-'
  });
  items.push({
    name: intl.get('LAST_CONNECTION_TIME'),
    value: device.state.connectedAt
      ? dayjs(device.state.connectedAt * 1000).format('YYYY-MM-DD HH:mm:ss')
      : '-'
  });
  items.push({
    name: intl.get('PRODUCT_ID'),
    value: device.information.product_id ? device.information.product_id : '-'
  });
  if (device.typeId !== DeviceType.Gateway && device.typeId !== DeviceType.Router) {
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
          <Link
            to={`http://${device.information.ip_address}`}
            target={'_blank'}
            style={{ fontSize: '10pt' }}
          >
            {intl.get('GO_TO_ADMIN_PORTAL')}
          </Link>
        </Space>
      )
    });
  }
  return (
    <NameValueGroups
      items={items}
      gutter={{ xxl: 304, xl: 256, lg: 256, md: 256 }}
      col={{ xxl: 8, xl: 12, lg: 12, md: 12 }}
    />
  );
};
