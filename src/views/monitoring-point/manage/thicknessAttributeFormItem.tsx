import { Form, Input, InputNumber, Radio } from 'antd';
import * as React from 'react';
import intl from 'react-intl-universal';

export const ThicknessAttributeFormItem: React.FC<{
  label: string;
  name: string;
  itemName?: number;
}> = ({ label, itemName, name }) => {
  return (
    <Form.Item label={label}>
      <Input.Group compact={true}>
        <Form.Item
          noStyle={true}
          name={
            itemName !== undefined
              ? [itemName, 'attributes', name, 'enabled']
              : ['attributes', name, 'enabled']
          }
          initialValue={false}
        >
          <Radio.Group optionType='button' buttonStyle='solid' style={{ marginRight: 20 }}>
            <Radio.Button key={0} value={true}>
              {intl.get('ENABLED')}
            </Radio.Button>
            <Radio.Button key={1} value={false}>
              {intl.get('DISABLED')}
            </Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          noStyle={true}
          name={
            itemName !== undefined
              ? [itemName, 'attributes', name, 'value']
              : ['attributes', name, 'value']
          }
        >
          <InputNumber
            placeholder={intl.get('PLEASE_ENTER_SOMETHING', {
              something: label
            })}
            style={{ width: 200 }}
            controls={false}
            addonAfter='mm'
          />
        </Form.Item>
      </Input.Group>
    </Form.Item>
  );
};
