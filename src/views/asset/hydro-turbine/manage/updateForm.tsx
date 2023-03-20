import { Form, Input } from 'antd';
import { FormInstance } from 'antd/lib/form/Form';
import React from 'react';
import { defaultValidateMessages, Rules } from '../../../../constants/validator';
import { Asset, AssetRow } from '../../types';
import {
  PLEASE_INPUT_HYDRO_TURBINE_NAME,
  HYDRO_TURBINE_ASSET_TYPE_ID,
  HYDRO_TURBINE_NAME
} from '../config';
import { convertRow } from '../common/utils';

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
      labelCol={{ span: 6 }}
      validateMessages={defaultValidateMessages}
      style={style}
    >
      <Form.Item label={HYDRO_TURBINE_NAME} name='name' rules={[Rules.range(4, 50)]}>
        <Input placeholder={PLEASE_INPUT_HYDRO_TURBINE_NAME} />
      </Form.Item>
      <Form.Item name='type' hidden={true} initialValue={HYDRO_TURBINE_ASSET_TYPE_ID}></Form.Item>
      {children}
    </Form>
  );
};
