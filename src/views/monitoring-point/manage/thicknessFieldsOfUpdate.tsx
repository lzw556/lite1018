import { InputNumber } from 'antd';
import React from 'react';
import intl from 'react-intl-universal';
import { FormInputItem } from '../../../components/formInputItem';
import { ThicknessAttributeFormItem } from './thicknessAttributeFormItem';

export const ThicknessFieldsOfUpdate = ({ form }: { form?: any }) => {
  return (
    <>
      <ThicknessAttributeFormItem
        label={intl.get('INITIAL_THICKNESS')}
        name='initial_thickness'
        form={form}
      />
      <ThicknessAttributeFormItem
        label={intl.get('CRITICAL_THICKNESS')}
        name='critical_thickness'
        form={form}
      />
      <FormInputItem
        label={intl.get('CORROSION_RATE_SHORT_TERM')}
        name={['attributes', 'corrosion_rate_short_term']}
        requiredMessage={intl.get('PLEASE_ENTER_SOMETHING', {
          something: intl.get('CORROSION_RATE_SHORT_TERM')
        })}
        initialValue={30}
        numericRule={{
          isInteger: true,
          min: 1,
          message: intl.get('UNSIGNED_INTEGER_ENTER_PROMPT')
        }}
        numericChildren={
          <InputNumber
            placeholder={intl.get('PLEASE_ENTER_SOMETHING', {
              something: intl.get('CORROSION_RATE_SHORT_TERM')
            })}
            style={{ width: '100%' }}
            controls={false}
            addonAfter={intl.get('UNIT_DAY')}
          />
        }
      />
      <FormInputItem
        label={intl.get('CORROSION_RATE_LONG_TERM')}
        name={['attributes', 'corrosion_rate_long_term']}
        requiredMessage={intl.get('PLEASE_ENTER_SOMETHING', {
          something: intl.get('CORROSION_RATE_LONG_TERM')
        })}
        initialValue={365}
        numericRule={{
          isInteger: true,
          min: 1,
          message: intl.get('UNSIGNED_INTEGER_ENTER_PROMPT')
        }}
        numericChildren={
          <InputNumber
            placeholder={intl.get('PLEASE_ENTER_SOMETHING', {
              something: intl.get('CORROSION_RATE_LONG_TERM')
            })}
            style={{ width: '100%' }}
            controls={false}
            addonAfter={intl.get('UNIT_DAY')}
          />
        }
      />
    </>
  );
};
