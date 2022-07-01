import * as React from 'react';
import ShadowCard from '../../../../../components/shadowCard';
import { Device } from '../../../../../types/device';
import { SingleDeviceInfo } from './singleDeviceInfo';

export const MeasurementDevices: React.FC<{ devices: Device[]; alertLevel?: number }> = ({
  devices,
  alertLevel
}) => {
  const [key, setKey] = React.useState(devices[0].macAddress);
  if (devices.length === 1) return <SingleDeviceInfo {...devices[0]} alertLevel={alertLevel}/>;
  const contents: Record<string, JSX.Element> = {};
  devices.forEach((device) => {
    contents[device.macAddress] = <SingleDeviceInfo {...device} alertLevel={alertLevel}/>;
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
