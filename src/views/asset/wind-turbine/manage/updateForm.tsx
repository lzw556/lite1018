import { Form, Input } from 'antd';
import { FormInstance } from 'antd/lib/form/Form';
import React from 'react';
import { defaultValidateMessages, Rules } from '../../../../constants/validator';
import { Asset, AssetRow } from '../../types';
import {
  PLEASE_INPUT_WIND_TURBINE_NAME,
  WIND_TURBINE_ASSET_TYPE_ID,
  WIND_TURBINE_NAME
} from '../config';
import { convertRow } from '../common/utils';
import intl from 'react-intl-universal';

export const UpdateForm = ({
  wind,
  form,
  children,
  style
}: {
  wind: AssetRow;
  form: FormInstance<Asset>;
  children?: JSX.Element;
  style?: React.CSSProperties;
}) => {
  React.useEffect(() => {
    if (wind) {
      form.resetFields();
      const values = convertRow(wind);
      if (values) form.setFieldsValue(values);
    }
  }, [wind, form]);

  return (
    <Form
      form={form}
      labelCol={{ span: 8 }}
      validateMessages={defaultValidateMessages}
      style={style}
    >
      <Form.Item label={intl.get(WIND_TURBINE_NAME)} name='name' rules={[Rules.range(4, 50)]}>
        <Input placeholder={intl.get(PLEASE_INPUT_WIND_TURBINE_NAME)} />
      </Form.Item>
      <Form.Item name='type' hidden={true} initialValue={WIND_TURBINE_ASSET_TYPE_ID}></Form.Item>
      {children}
    </Form>
  );
};
