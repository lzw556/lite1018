import { Form, Input } from 'antd';
import { FormInstance } from 'antd/lib/form/Form';
import React from 'react';
import { defaultValidateMessages, Rules } from '../../../../constants/validator';
import { Asset, AssetRow } from '../../types';
import { PLEASE_INPUT_AREA_NAME, AREA_NAME, AREA_ASSET_TYPE_ID } from '../config';
import { convertRow } from '../common/utils';
import intl from 'react-intl-universal';

export const UpdateForm = ({
  general,
  form,
  children,
  style
}: {
  general: AssetRow;
  form: FormInstance<Asset>;
  children?: JSX.Element;
  style?: React.CSSProperties;
}) => {
  React.useEffect(() => {
    if (general) {
      form.resetFields();
      const values = convertRow(general);
      if (values) form.setFieldsValue(values);
    }
  }, [general, form]);

  return (
    <Form
      form={form}
      labelCol={{ span: 6 }}
      validateMessages={defaultValidateMessages}
      style={style}
    >
      <Form.Item label={intl.get(AREA_NAME)} name='name' rules={[Rules.range(4, 50)]}>
        <Input placeholder={intl.get(PLEASE_INPUT_AREA_NAME)} />
      </Form.Item>
      <Form.Item name='type' hidden={true} initialValue={AREA_ASSET_TYPE_ID}></Form.Item>
      {children}
    </Form>
  );
};
