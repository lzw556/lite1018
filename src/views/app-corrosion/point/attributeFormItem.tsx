import * as React from 'react';
import { Form, Input, InputNumber, Radio } from 'antd';
import intl from 'react-intl-universal';

export const AttributeFormItem: React.FC<{
  enabled?: boolean;
  label: string;
  name: string;
  nameIndex?: number;
  restFields?: {
    fieldKey?: number | undefined;
  };
}> = ({ enabled: initial, label, name, nameIndex, restFields }) => {
  const commonNameProp = ['attributes', name];
  const nameProp = nameIndex !== undefined ? [`${nameIndex}`, ...commonNameProp] : commonNameProp;

  //request structure
  // initial_thickness: { enabled: true; value: 5 };
  // response structure
  // initial_thickness_enabled: true
  // initial_thickness: 5;

  //request structure
  // critical_thickness: { enabled: false};
  // response structure
  // critical_thickness_enabled: false
  const radioGroupNameProp = [...nameProp, 'enabled'];
  const inputGroupNameProp = [...nameProp, 'value'];
  const [enabled, setEnabled] = React.useState(initial);

  return (
    <Form.Item label={label}>
      <Input.Group compact={true}>
        <Form.Item {...restFields} noStyle={true} name={radioGroupNameProp} initialValue={false}>
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
            {...restFields}
            noStyle={true}
            name={inputGroupNameProp}
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
