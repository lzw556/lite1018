import { Form, InputNumber } from 'antd';
import React from 'react';
import intl from 'react-intl-universal';
import { FormInputItem } from '../../../components/formInputItem';
import { ThicknessAttributeFormItem } from './thicknessAttributeFormItem';
import { getDisplayName } from '../../../utils/format';
import { useLocaleContext } from '../../../localeProvider';

export const ThicknessFieldsOfCreation = ({
  name,
  restFields
}: {
  name: number;
  restFields: {
    fieldKey?: number | undefined;
  };
}) => {
  const { language } = useLocaleContext();
  return (
    <>
      <ThicknessAttributeFormItem
        label={intl.get('INITIAL_THICKNESS')}
        itemName={name}
        name='initial_thickness'
      />
      <ThicknessAttributeFormItem
        label={intl.get('CRITICAL_THICKNESS')}
        itemName={name}
        name='critical_thickness'
      />
      <Form.Item
        required
        label={getDisplayName({
          name: intl.get('FIELD_CORROSION_RATE'),
          suffix: intl.get('UNIT_DAY'),
          lang: language
        })}
        style={{ marginBottom: 0 }}
      >
        <FormInputItem
          {...restFields}
          name={[name, 'attributes', 'corrosion_rate_short_term']}
          requiredMessage={intl.get('PLEASE_ENTER_SOMETHING', {
            something: intl.get('CORROSION_RATE_SHORT_TERM')
          })}
          initialValue={30}
          numericRule={{
            isInteger: true,
            min: 1,
            message: intl.get('UNSIGNED_INTEGER_ENTER_PROMPT')
          }}
          style={{ display: 'inline-block', width: 200, marginRight: 20 }}
          numericChildren={
            <InputNumber
              placeholder={intl.get('PLEASE_ENTER_SOMETHING', {
                something: intl.get('CORROSION_RATE_SHORT_TERM')
              })}
              style={{ width: '100%' }}
              controls={false}
            />
          }
        />
        <FormInputItem
          {...restFields}
          name={[name, 'attributes', 'corrosion_rate_long_term']}
          requiredMessage={intl.get('PLEASE_ENTER_SOMETHING', {
            something: intl.get('CORROSION_RATE_LONG_TERM')
          })}
          initialValue={365}
          numericRule={{
            isInteger: true,
            min: 1,
            message: intl.get('UNSIGNED_INTEGER_ENTER_PROMPT')
          }}
          style={{ display: 'inline-block', width: 200 }}
          numericChildren={
            <InputNumber
              placeholder={intl.get('PLEASE_ENTER_SOMETHING', {
                something: intl.get('CORROSION_RATE_LONG_TERM')
              })}
              style={{ width: '100%' }}
              controls={false}
            />
          }
        />
      </Form.Item>
    </>
  );
};
