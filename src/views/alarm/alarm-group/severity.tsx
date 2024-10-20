import React from 'react';
import { Form, Select } from 'antd';
import intl from 'react-intl-universal';
import { FormInputItemProps } from '../../../components/formInputItem';

export const Severity = ({ nameIndex, ...rest }: FormInputItemProps & { nameIndex: number }) => {
  return (
    <Form.Item label={intl.get('SEVERITY')} {...rest} name={[nameIndex, 'level']} initialValue={3}>
      <Select style={{ width: 120 }}>
        <Select.Option key={1} value={1}>
          {intl.get('ALARM_LEVEL_MINOR')}
        </Select.Option>
        <Select.Option key={2} value={2}>
          {intl.get('ALARM_LEVEL_MAJOR')}
        </Select.Option>
        <Select.Option key={3} value={3}>
          {intl.get('ALARM_LEVEL_CRITICAL')}
        </Select.Option>
      </Select>
    </Form.Item>
  );
};
