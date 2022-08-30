import { Form, Input, Radio } from 'antd';
import * as React from 'react';

export const AttributeFormItem: React.FC<{ label: string; name: string }> = ({ label, name }) => {
  return (
    <Form.Item label={label}>
      <Input.Group compact={true}>
        <Form.Item noStyle={true} name={['attributes', name, 'enabled']} initialValue={false}>
          <Radio.Group optionType='button' buttonStyle='solid'>
            <Radio.Button key={0} value={true}>
              启用
            </Radio.Button>
            <Radio.Button key={1} value={false}>
              禁用
            </Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          noStyle={true}
          name={['attributes', name, 'value']}
          initialValue=''
          rules={[{ type: 'number', transform: (value: string) => Number(value) }]}
        >
          <Input style={{ width: 'calc(100% - 130px)', marginLeft: 10 }} />
        </Form.Item>
      </Input.Group>
    </Form.Item>
  );
};
