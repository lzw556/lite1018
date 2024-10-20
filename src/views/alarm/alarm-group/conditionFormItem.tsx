import React from 'react';
import { Form, InputNumber, Select } from 'antd';
import intl from 'react-intl-universal';
import { FormInputItem, FormInputItemProps } from '../../../components/formInputItem';

export const ConditionFormItem = ({
  controlStyle,
  nameIndex,
  unitText,
  ...rest
}: FormInputItemProps & {
  controlStyle?: React.CSSProperties;
  nameIndex: number;
  unitText: string;
}) => {
  return (
    <FormInputItem
      label={intl.get('CONDITION')}
      {...rest}
      name={[nameIndex, 'threshold']}
      requiredMessage={intl.get('PLEASE_ENTER_SOMETHING', {
        something: intl.get('CONDITION')
      })}
      numericRule={{
        isInteger: false
      }}
      numericChildren={
        <InputNumber
          addonBefore={
            <Form.Item {...rest} name={[nameIndex, 'operation']} noStyle initialValue={'>='}>
              <Select style={controlStyle ? { ...controlStyle } : { width: 65 }}>
                <Select.Option key={'>'} value={'>'}>
                  &gt;
                </Select.Option>
                <Select.Option key={'>='} value={'>='}>
                  &gt;=
                </Select.Option>
                <Select.Option key={'<'} value={'<'}>
                  &lt;
                </Select.Option>
                <Select.Option key={'<='} value={'<='}>
                  &lt;=
                </Select.Option>
              </Select>
            </Form.Item>
          }
          controls={false}
          addonAfter={unitText}
        />
      }
    />
  );
};
