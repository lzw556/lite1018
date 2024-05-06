import { Tag } from 'antd';
import React from 'react';
import { NameValueGroups } from '../../../components/name-values';
import ShadowCard from '../../../components/shadowCard';
import { Device } from '../../../types/device';
import { DeviceType } from '../../../types/device_type';
import dayjs from '../../../utils/dayjsUtils';
import { generateColProps } from '../../../utils/grid';
import { convertAlarmLevelToState, getAlarmLevelColor, getAlarmStateText } from '../../asset';
import { MonitoringPointRow } from '../types';
import intl from 'react-intl-universal';
import { getDisplayName, toMac } from '../../../utils/format';
import { SelfLink } from '../../../components/selfLink';
import { isMobile } from '../../../utils/deviceDetection';
import { useLocaleContext } from '../../../localeProvider';

export const RelatedDevices = (point: MonitoringPointRow) => {
  const { bindingDevices: devices = [], alertLevel, data } = point;
  const [key, setKey] = React.useState(devices[0].macAddress);
  if (devices.length === 1)
    return (
      <SingleDeviceInfo
        {...devices[0]}
        alertLevel={alertLevel}
        lastSamplingTime={data?.timestamp}
      />
    );
  const contents: Record<string, JSX.Element> = {};
  devices.forEach((device) => {
    contents[device.macAddress] = (
      <SingleDeviceInfo {...device} alertLevel={alertLevel} lastSamplingTime={data?.timestamp} />
    );
  });

  return (
    <ShadowCard
      tabList={devices.map((device) => ({ key: device.macAddress, tab: device.name }))}
      onTabChange={(key) => {
        setKey(key);
      }}
    >
      {key && contents[key]}
    </ShadowCard>
  );
};

function SingleDeviceInfo(props: Device & { alertLevel?: number; lastSamplingTime?: number }) {
  const { language } = useLocaleContext();
  const colProps = generateColProps({ xxl: 8, xl: 12, lg: 12, md: 12, xs: 24 });
  const { id, name, typeId, information, state, macAddress, alertLevel, lastSamplingTime } = props;

  return (
    <ShadowCard>
      <NameValueGroups
        divider={isMobile ? 10 : 40}
        col={{ ...colProps }}
        items={[
          {
            name: intl.get('DEVICE_NAME'),
            value: <SelfLink to={`/devices/${id}`}>{name}</SelfLink>
          },
          { name: intl.get('TYPE'), value: intl.get(DeviceType.toString(typeId)) },
          { name: intl.get('MODEL'), value: information?.model ?? '-' },
          { name: intl.get('MAC_ADDRESS'), value: toMac(macAddress.toUpperCase()) },
          {
            name: getDisplayName({
              name: intl.get('BATTERY_VOLTAGE'),
              lang: language,
              suffix: 'mV'
            }),
            value: state?.batteryVoltage ?? '-'
          },
          {
            name: getDisplayName({
              name: intl.get('SIGNAL_STRENGTH'),
              lang: language,
              suffix: 'dBm'
            }),
            value: state?.signalLevel ?? '-'
          },
          {
            name: intl.get('STATUS'),
            value: (
              <Tag color={getAlarmLevelColor(convertAlarmLevelToState(alertLevel || 0))}>
                {getAlarmStateText(convertAlarmLevelToState(alertLevel || 0))}
              </Tag>
            )
          },
          {
            name: intl.get('LAST_CONNECTION_TIME'),
            value: state?.connectedAt
              ? dayjs.unix(state.connectedAt).local().format('YYYY-MM-DD HH:mm:ss')
              : '-'
          },
          {
            name: intl.get('LAST_SAMPLING_TIME'),
            value:
              lastSamplingTime && lastSamplingTime > 0
                ? dayjs.unix(lastSamplingTime).local().format('YYYY-MM-DD HH:mm:ss')
                : '-'
          }
        ]}
      />
    </ShadowCard>
  );
}
