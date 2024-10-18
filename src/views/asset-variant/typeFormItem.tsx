import React from 'react';
import { Form, Select } from 'antd';
import intl from 'react-intl-universal';
import { AssetCategory } from '../asset-common';

export const TypeFormItem = ({
  types,
  onChange,
  disabled
}: {
  types: AssetCategory[];
  onChange?: (type: number) => void;
  disabled?: boolean;
}) => {
  return (
    <Form.Item
      label={intl.get('TYPE')}
      name='type'
      rules={[
        {
          required: true,
          message: intl.get('PLEASE_SELECT_SOMETHING', { something: intl.get('TYPE') })
        }
      ]}
    >
      <Select
        disabled={disabled}
        options={types.map((t) => ({ label: intl.get(t.label), value: t.type }))}
        onChange={onChange}
      />
    </Form.Item>
  );
};
