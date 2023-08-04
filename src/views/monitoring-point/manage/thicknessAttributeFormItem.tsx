import { Form, Input, InputNumber, Radio } from 'antd';
import * as React from 'react';
import intl from 'react-intl-universal';

export const ThicknessAttributeFormItem: React.FC<{
  label: string;
  name: string;
  itemName?: number;
  form?: any;
}> = ({ label, itemName, name, form }) => {
  const enabledFormItemName =
    itemName !== undefined
      ? [itemName, 'attributes', name, 'enabled']
      : ['attributes', name, 'enabled'];

  const [enabled, setEnabled] = React.useState(false);
  const initialEnabled = form?.getFieldValue(enabledFormItemName);
  if (initialEnabled !== undefined && enabled !== initialEnabled) {
    setEnabled(initialEnabled);
  }

  return (
    <Form.Item label={label}>
      <Input.Group compact={true}>
        <Form.Item noStyle={true} name={enabledFormItemName} initialValue={false}>
          <Radio.Group
            optionType='button'
            buttonStyle='solid'
            style={{ marginRight: 20 }}
            onChange={(e) => {
              setEnabled(e.target.value);
            }}
          >
            <Radio.Button key={0} value={true}>
              {intl.get('ENABLED')}
            </Radio.Button>
            <Radio.Button key={1} value={false}>
              {intl.get('DISABLED')}
            </Radio.Button>
          </Radio.Group>
        </Form.Item>
        {enabled && (
          <Form.Item
            noStyle={true}
            name={
              itemName !== undefined
                ? [itemName, 'attributes', name, 'value']
                : ['attributes', name, 'value']
            }
            rules={[
              {
                required: true,
                message: intl.get('PLEASE_ENTER_SOMETHING', {
                  something: label
                })
              }
            ]}
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
        )}
      </Input.Group>
    </Form.Item>
  );
};
