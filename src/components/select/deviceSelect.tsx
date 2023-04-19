import { Select, SelectProps, Typography } from 'antd';
import { FC, useEffect, useState } from 'react';
import { Device } from '../../types/device';
import { GetDevicesRequest } from '../../apis/device';
import { toMac } from '../../utils/format';
import { useAppConfigContext } from '../../views/asset';

export interface DeviceSelectProps extends SelectProps<any> {
  filters?: any;
  dispalyField?: keyof Pick<Device, 'id' | 'macAddress'>;
  onTypeChange?: (type: number | undefined) => void;
}

const { Option } = Select;

const DeviceSelect: FC<DeviceSelectProps> = (props) => {
  const config = useAppConfigContext();
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
    >
      {devices.map((device) => (
        <Option key={device.id} value={device[dispalyField]}>
          <Typography.Text strong>{device.name}</Typography.Text>
          <br />
          {config !== 'corrosionWirelessHART' && (
            <Typography.Text type={'secondary'}>
              {toMac(device.macAddress.toUpperCase())}
            </Typography.Text>
          )}
        </Option>
      ))}
    </Select>
  );
};

export default DeviceSelect;
