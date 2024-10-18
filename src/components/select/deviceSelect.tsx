import { Select, SelectProps, Typography } from 'antd';
import { FC, useEffect, useState } from 'react';
import { Device } from '../../types/device';
import { GetDevicesRequest } from '../../apis/device';
import { toMac } from '../../utils/format';
import { useAppType } from '../../config';

export interface DeviceSelectProps extends SelectProps<any> {
  filters?: any;
  dispalyField?: keyof Pick<Device, 'id' | 'macAddress'>;
  onTypeChange?: (type: number | undefined) => void;
}

const DeviceSelect: FC<DeviceSelectProps> = (props) => {
  const appType = useAppType();
  const { filters, dispalyField = 'id' } = props;
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    GetDevicesRequest(filters).then(setDevices);
  }, [filters]);

  return (
    <Select
      {...props}
      onChange={(value, option) => {
        props.onChange?.(value, option);
        props.onTypeChange?.(devices.find((device) => device.id === value)?.typeId);
      }}
      options={devices.map((d) => ({
        value: d[dispalyField],
        label: d.name,
        macAddress: d.macAddress
      }))}
      optionRender={(option) => (
        <>
          <Typography.Text strong>{option.data.label}</Typography.Text>
          <br />
          {appType !== 'corrosionWirelessHART' && (
            <Typography.Text type={'secondary'}>
              {toMac(option.data.macAddress.toUpperCase())}
            </Typography.Text>
          )}
        </>
      )}
    />
  );
};

export default DeviceSelect;
