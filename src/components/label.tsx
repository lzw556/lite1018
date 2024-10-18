import { Form } from 'antd';
import './index.css';
import { FC } from 'react';

export interface LabelProps {
  name?: string;
  width?: number;
}

const Label: FC<LabelProps> = ({ name, width, children }) => {
  return (
    <Form.Item
      label={name}
      className='ts-border'
      style={{ height: '32px', width, marginBottom: 0 }}
    >
      {children}
    </Form.Item>
  );
};

export default Label;
