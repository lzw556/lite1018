import { Select, SelectProps } from 'antd';
import { FC } from 'react';
import Label from './label';
import { CaretDownOutlined } from '@ant-design/icons';

export interface LabelSelectProps extends SelectProps<any> {
  label?: string;
}

const LabelSelect: FC<LabelSelectProps> = (props) => {
  const { label } = props;
  return (
    <Label name={label}>
      <Select {...props} bordered={false} suffixIcon={<CaretDownOutlined />}></Select>
    </Label>
  );
};

export default LabelSelect;
