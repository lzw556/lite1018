import { DeviceType } from '../../types/device_type';
import { Select, SelectProps } from 'antd';
import { FC, useEffect } from 'react';
import { CaretDownOutlined } from '@ant-design/icons';
import { SENSORS } from '../../config/assetCategory.config';
import { useAssetCategoryContext } from '../../views/asset/components/assetCategoryContext';
import intl from 'react-intl-universal';

const { Option, OptGroup } = Select;

export interface DeviceTypeSelectProps extends SelectProps<any> {
  sensors?: DeviceType[];
  onChange?: (value: any) => void;
}

const DeviceTypeSelect: FC<DeviceTypeSelectProps> = (props) => {
  const { sensors, children, onChange } = props;
  const category = useAssetCategoryContext();

  useEffect(() => {
    if (onChange && sensors) {
      onChange(sensors[0]);
    }
  }, []);

  const renderSensors = () => {
    return SENSORS.get(category)?.map((item) => (
      <Option key={item} value={item}>
        {DeviceType.toString(item)}
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
          <OptGroup label={intl.get('GATEWAY')} key={'gateway'}>
            <Option key={1} value={1}>
              {intl.get(DeviceType.toString(DeviceType.Gateway))}
            </Option>
          </OptGroup>
          <OptGroup label={intl.get('ROUTER')} key={'router'}>
            <Option key={257} value={257}>
              {intl.get(DeviceType.toString(DeviceType.Router))}
            </Option>
          </OptGroup>
          <OptGroup label={intl.get('SENSOR')} key={'sensor'}>
            {SENSORS.get(category)?.map((item) => (
              <Option key={item} value={item}>
                {intl.get(DeviceType.toString(item))}
              </Option>
            ))}
          </OptGroup>
        </Select>
      );
    }
  };
  return render();
};

export default DeviceTypeSelect;
