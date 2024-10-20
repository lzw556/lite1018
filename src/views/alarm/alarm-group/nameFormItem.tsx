import React from 'react';
import { Input } from 'antd';
import intl from 'react-intl-universal';
import { FormInputItem } from '../../../components/formInputItem';

export const NameFormItem = ({
  inputStyle,
  nameIndex,
  restFields
}: {
  inputStyle?: React.CSSProperties;
  nameIndex: number;
  restFields: any;
}) => {
  return (
    <FormInputItem
      {...restFields}
      label={intl.get('NAME')}
      lengthLimit={{
        min: 4,
        max: 16,
        label: intl.get('NAME').toLowerCase()
      }}
      name={[nameIndex, 'name']}
      requiredMessage={intl.get('PLEASE_ENTER_NAME')}
    >
      <Input placeholder={intl.get('PLEASE_ENTER_NAME')} style={inputStyle} />
    </FormInputItem>
  );
};
