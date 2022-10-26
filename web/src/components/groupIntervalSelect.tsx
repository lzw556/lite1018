import { GROUP_INTERVAL } from '../constants';
import { Select, SelectProps } from 'antd';
import { FC } from 'react';

const { Option } = Select;

const GroupIntervalSelect: FC<SelectProps<any>> = (props) => {
  return (
    <Select {...props}>
      {GROUP_INTERVAL.map((item) => (
        <Option value={item.value} key={item.value}>
          {item.text}
        </Option>
      ))}
    </Select>
  );
};

export default GroupIntervalSelect;
