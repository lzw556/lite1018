import { Select, SelectProps } from 'antd';
import { FC } from 'react';
import intl from 'react-intl-universal';

const { Option } = Select;

export interface CommunicationPeriodSelectProps extends SelectProps<any> {
  periods: { value: number; text: string }[];
}

const CommunicationPeriodSelect: FC<CommunicationPeriodSelectProps> = (props) => {
  const { periods } = props;

  return (
    <Select {...props}>
      {periods.map((item) => (
        <Option key={item.value} value={item.value}>
          {item.text ? intl.get(item.text).d(item.text) : item.text}
        </Option>
      ))}
    </Select>
  );
};

export default CommunicationPeriodSelect;
