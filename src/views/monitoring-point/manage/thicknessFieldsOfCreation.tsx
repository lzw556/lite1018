import { Form, InputNumber } from 'antd';
import React from 'react';
import intl from 'react-intl-universal';
import { FormInputItem } from '../../../components/formInputItem';

export const ThicknessFieldsOfCreation = ({
  name,
  restFields
}: {
  name: number;
  restFields: {
    fieldKey?: number | undefined;
  };
}) => {
  return (
    <>
      <Form.Item label={`${intl.get('FIELD_THICKNESS')}(mm)`} style={{ marginBottom: 0 }}>
        <FormInputItem
          {...restFields}
          name={[name, 'initial_thickness']}
          requiredMessage={intl.get('PLEASE_ENTER_SOMETHING', {
            something: intl.get('INITIAL_THICKNESS')
          })}
          numericRule={{
            message: intl.get('PLEASE_ENTER_NUMERIC')
          }}
          style={{ display: 'inline-block', width: 200, marginRight: 20 }}
          numericChildren={
            <InputNumber
              placeholder={intl.get('PLEASE_ENTER_SOMETHING', {
                something: intl.get('INITIAL_THICKNESS')
              })}
              style={{ width: '100%' }}
              controls={false}
            />
          }
        />
        <FormInputItem
          {...restFields}
          name={[name, 'critical_thickness']}
          requiredMessage={intl.get('PLEASE_ENTER_SOMETHING', {
            something: intl.get('CRITICAL_THICKNESS')
          })}
          numericRule={{
            message: intl.get('PLEASE_ENTER_NUMERIC')
          }}
          style={{ display: 'inline-block', width: 200 }}
          numericChildren={
            <InputNumber
              placeholder={intl.get('PLEASE_ENTER_SOMETHING', {
                something: intl.get('CRITICAL_THICKNESS')
              })}
              style={{ width: '100%' }}
              controls={false}
            />
          }
        />
      </Form.Item>
      <Form.Item
        label={`${intl.get('FIELD_CORROSION_RATE')}(${intl.get('UNIT_DAY')})`}
        style={{ marginBottom: 0 }}
      >
        <FormInputItem
          {...restFields}
          name={[name, 'corrosion_rate_short_term']}
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
          name={[name, 'corrosion_rate_long_term']}
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
