import { Radio } from 'antd';
import { Device } from '../../../../types/device';
import * as React from 'react';
import { DeviceType } from '../../../../types/device_type';
import intl from 'react-intl-universal';
import { BasicSettings } from './basic';
import DeviceSettings from '../../../device/detail/setting/deviceSettings';

export interface SettingPageProps {
  device: Device;
  onUpdate: () => void;
}

const SettingPage: React.FC<SettingPageProps> = ({ device, onUpdate }) => {
  const [type, setType] = React.useState('basic');
  const options = [];
  const { typeId } = device;
  if (DeviceType.isSensor(typeId)) {
    options.push(
      { label: intl.get('BASIC_INFORMATION'), value: 'basic' },
      { label: intl.get('DEVICE_SETTINGS'), value: 'device' }
    );
  }
  if (options.length === 0) {
    return <BasicSettings device={device} onUpdate={onUpdate} />;
  } else {
    return (
      <>
        <Radio.Group
          style={{ marginBottom: 12 }}
          options={options}
          onChange={(e) => setType(e.target.value)}
          value={type}
          optionType='button'
          buttonStyle='solid'
        />
        {type === 'basic' && <BasicSettings device={device} onUpdate={onUpdate} />}
        {type === 'device' && <DeviceSettings device={device} />}
      </>
    );
  }
};

export default SettingPage;
