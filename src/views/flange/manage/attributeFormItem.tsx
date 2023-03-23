import { Form, Input, Radio } from 'antd';
import * as React from 'react';
import intl from 'react-intl-universal';
import { useLocaleContext } from '../../../localeProvider';

export const AttributeFormItem: React.FC<{ label: string; name: string }> = ({ label, name }) => {
  const { language } = useLocaleContext();
  return (
    <Form.Item label={label}>
      <Input.Group compact={true}>
        <Form.Item noStyle={true} name={['attributes', name, 'enabled']} initialValue={false}>
          <Radio.Group optionType='button' buttonStyle='solid'>
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
          name={['attributes', name, 'value']}
          initialValue=''
          rules={[
            {
              type: 'number',
              transform(value: number) {
                if (value) {
                  return Number(value);
                }
                return value;
              },
              message: intl.get('PLEASE_ENTER_NUMERIC')
            }
          ]}
        >
          <Input
            style={{
              width: `calc(100% - ${language === 'en-US' ? 190 : 130}px)`,
              marginLeft: 10
            }}
          />
        </Form.Item>
      </Input.Group>
    </Form.Item>
  );
};
