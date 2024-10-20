import React from 'react';
import { Form, FormItemProps, InputNumber } from 'antd';
import { Rule } from 'antd/lib/form';
import intl from 'react-intl-universal';

export type FormInputItemProps = FormItemProps & {
  requiredMessage?: string;
  lengthLimit?: { min: number; max: number; label: string };
  numericRule?: {
    isInteger?: boolean;
    min?: number;
    max?: number;
    message?: string;
    others?: Rule[];
  };
  numericChildren?: JSX.Element;
  placeholder?: string;
};

export const FormInputItem: React.FC<FormInputItemProps> = ({
  name,
  label,
  children,
  requiredMessage,
  lengthLimit,
  numericRule,
  numericChildren,
  placeholder,
  ...rest
}) => {
  const rules: any = [];
  if (requiredMessage !== undefined && requiredMessage !== '') {
    rules.push({ required: true, message: requiredMessage });
  }
  if (numericRule !== undefined) {
    const { isInteger, min, max, message, others } = numericRule;
    rules.push({
      type: isInteger ? 'integer' : 'number',
      min,
      max,
      message: message ?? intl.get('PLEASE_ENTER_NUMERIC')
    });
    if (others && others.length > 0) {
      rules.push(...others);
    }
  }

  if (lengthLimit !== undefined) {
    const { min, max, label } = lengthLimit;
    rules.push({
      min,
      max,
      message: intl.get('LENGTH_OF_SOMETHING_MUST_BE_BETWEEN_MIN_AND_MAX', {
        something: label,
        min,
        max
      })
    });
  }
  return (
    <Form.Item name={name} label={label} rules={rules} {...rest}>
      {numericRule !== undefined ? (
        numericChildren !== undefined ? (
          numericChildren
        ) : (
          <InputNumber controls={false} style={{ width: '100%' }} placeholder={placeholder} />
        )
      ) : (
        children
      )}
    </Form.Item>
  );
};
