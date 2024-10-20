import React from 'react';
import intl from 'react-intl-universal';
import { FormInputItem, FormInputItemProps } from '../../../components/formInputItem';

export const DurationFormItem = ({
  controlStyle,
  nameIndex,
  numericChildren,
  ...rest
}: FormInputItemProps & {
  controlStyle?: React.CSSProperties;
  nameIndex: number;
  numericChildren?: JSX.Element;
}) => {
  return (
    <FormInputItem
      {...rest}
      initialValue={1}
      label={intl.get('DURATION')}
      name={[nameIndex, 'duration']}
      numericRule={{
        isInteger: true,
        min: 1,
        message: intl.get('UNSIGNED_INTEGER_ENTER_PROMPT')
      }}
      numericChildren={numericChildren}
      requiredMessage={intl.get('PLEASE_ENTER_SOMETHING', {
        something: intl.get('DURATION')
      })}
    />
  );
};
