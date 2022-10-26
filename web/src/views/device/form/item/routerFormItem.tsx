import { Form, Select } from 'antd';

const RouterFormItem = () => {
  return (
    <Form.Item label={'所属父设备'} name='parent'>
      <Select placeholder={'请选择所属父设备'}></Select>
    </Form.Item>
  );
};

export default RouterFormItem;
