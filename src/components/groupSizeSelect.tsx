import { Select, SelectProps } from 'antd';
import { FC } from 'react';

const { Option } = Select;

const GroupSizeSelect: FC<SelectProps<any>> = (props) => {
  return (
    <Select {...props}>
      <Option key={1} value={1}>
        1
      </Option>
      <Option key={2} value={2}>
        2
      </Option>
      <Option key={4} value={4}>
        4
      </Option>
      <Option key={8} value={8}>
        8
      </Option>
    </Select>
  );
};

export default GroupSizeSelect;
