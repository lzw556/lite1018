import { Radio } from 'antd';
import { Device } from '../../../../types/device';
import * as React from 'react';
import DeviceSettings from './deviceSettings';
import { DeviceType } from '../../../../types/device_type';
import { BasicSettings } from './basicSettings';
import intl from 'react-intl-universal';

export interface SettingPageProps {
  device: Device;
  onUpdate: () => void;
}

const SettingPage: React.FC<SettingPageProps> = ({ device, onUpdate }) => {
  const [type, setType] = React.useState('basic');
  const options = [];
  const { typeId } = device;
  if (typeId !== DeviceType.Router) {
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
