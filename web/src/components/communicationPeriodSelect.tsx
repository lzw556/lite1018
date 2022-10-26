import { Select, SelectProps } from 'antd';
import { FC } from 'react';
import { CaretDownOutlined } from '@ant-design/icons';

const { Option } = Select;

export interface CommunicationPeriodSelectProps extends SelectProps<any> {
  periods: { value: number; text: string }[];
}

const CommunicationPeriodSelect: FC<CommunicationPeriodSelectProps> = (props) => {
  const { periods } = props;

  return (
    <Select {...props} suffixIcon={<CaretDownOutlined />}>
      {periods.map((item) => (
        <Option key={item.value} value={item.value}>
          {item.text}
        </Option>
      ))}
    </Select>
  );
};

export default CommunicationPeriodSelect;
