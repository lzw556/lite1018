import { FC, useEffect } from 'react';
import { Select, SelectProps } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import { DeviceType } from '../../types/device_type';
import { App, useAppType } from '../../config';

const { Option, OptGroup } = Select;

export interface DeviceTypeSelectProps extends SelectProps<any> {
  sensors?: DeviceType[];
  onChange?: (value: any) => void;
}

const DeviceTypeSelect: FC<DeviceTypeSelectProps> = (props) => {
  const { sensors, children, onChange } = props;
  const appType = useAppType();

  useEffect(() => {
    if (onChange && sensors) {
      onChange(sensors[0]);
    }
  }, [onChange, sensors]);

  const renderSensors = () => {
    return App.getDeviceTypes(appType).map((item) => (
      <Option key={item} value={item}>
        {intl.get(DeviceType.toString(item))}
      </Option>
    ));
  };

  const render = () => {
    if (sensors) {
      return (
        <Select {...props} suffixIcon={<CaretDownOutlined />}>
          {children}
          {renderSensors()}
        </Select>
      );
    } else {
      return (
        <Select {...props}>
          {appType !== 'corrosionWirelessHART' && (
            <>
              <OptGroup label={intl.get('GATEWAY')} key={'gateway'}>
                {DeviceType.getGateways().map((t) => (
                  <Option key={t} value={t}>
                    {intl.get(DeviceType.toString(t))}
                  </Option>
                ))}
              </OptGroup>
              <OptGroup label={intl.get('RELAY')} key={'router'}>
                {DeviceType.getRouters().map((t) => (
                  <Option key={t} value={t}>
                    {intl.get(DeviceType.toString(t))}
                  </Option>
                ))}
              </OptGroup>
            </>
          )}
          <OptGroup label={intl.get('SENSOR')} key={'sensor'}>
            {renderSensors()}
          </OptGroup>
        </Select>
      );
    }
  };
  return render();
};

export default DeviceTypeSelect;
