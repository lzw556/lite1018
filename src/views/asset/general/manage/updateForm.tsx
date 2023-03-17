import { Form, Input, Select } from 'antd';
import { FormInstance } from 'antd/lib/form/Form';
import React from 'react';
import { ROOT_ASSETS } from '../../../../config/assetCategory.config';
import { defaultValidateMessages, Rules } from '../../../../constants/validator';
import { Asset, AssetRow } from '../../types';
import {
  PLEASE_INPUT_GENERAL_NAME,
  GENERAL_NAME,
  GENERAL_PARENT,
  PLEASE_SELECT_GENERAL_PARENT
} from '../common/types';
import { convertRow } from '../common/utils';

export const UpdateForm = ({
  general,
  parents = [],
  form,
  children,
  style
}: {
  general: AssetRow;
  parents?: AssetRow[];
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
      <Form.Item label={GENERAL_NAME} name='name' rules={[Rules.range(4, 50)]}>
        <Input placeholder={PLEASE_INPUT_GENERAL_NAME} />
      </Form.Item>
      <Form.Item name='type' hidden={true} initialValue={ROOT_ASSETS.get('general')}></Form.Item>
      {parents?.length > 0 ? (
        <Form.Item
          label={GENERAL_PARENT}
          name='parent_id'
          rules={[{ required: true, message: PLEASE_SELECT_GENERAL_PARENT }]}
          hidden={general.parentId === 0}
        >
          <Select placeholder={PLEASE_SELECT_GENERAL_PARENT}>
            {parents.map(({ id, name, attributes }) => (
              <Select.Option key={id} value={id} attributes={attributes}>
                {name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      ) : (
        <Form.Item name='parent_id' hidden={true} initialValue={0}></Form.Item>
      )}
      {children}
    </Form>
  );
};
