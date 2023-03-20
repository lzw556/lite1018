import { Form, Input, Radio, Select } from 'antd';
import { FormInstance } from 'antd/lib/form/Form';
import React from 'react';
import { defaultValidateMessages, Rules } from '../../../../../constants/validator';
import { getAssets } from '../../../services';
import { Asset, AssetRow } from '../../../types';
import {
  AREA_ASSET_TYPE_ID,
  AREA,
  PLEASE_SELECT_AREA,
  AREA_ASSET_NAME,
  PLEASE_INPUT_AREA_ASSET_NAME,
  AREA_ASSET_TYPE,
  PLEASE_SELECT_AREA_ASSET_TYPE,
  AREA_ASSET_TYPES
} from '../../config';
import { convertRow } from '../../common/utils';

export const UpdateForm = ({
  asset,
  form,
  children,
  style
}: {
  asset: AssetRow;
  form: FormInstance<Asset>;
  children?: JSX.Element;
  style?: React.CSSProperties;
}) => {
  const [parents, setParents] = React.useState<AssetRow[]>([]);

  React.useEffect(() => {
    getAssets({ type: AREA_ASSET_TYPE_ID }).then(setParents);
  }, [asset.id]);

  React.useEffect(() => {
    if (asset) {
      form.resetFields();
      const values = convertRow(asset);
      if (values) form.setFieldsValue(values);
    }
  }, [asset, form]);

  return (
    <Form
      form={form}
      labelCol={{ span: 6 }}
      validateMessages={defaultValidateMessages}
      style={style}
    >
      <Form.Item
        label={AREA_ASSET_TYPE}
        name='type'
        rules={[{ required: true, message: PLEASE_SELECT_AREA_ASSET_TYPE }]}
      >
        <Radio.Group>
          {AREA_ASSET_TYPES.map((t) => (
            <Radio key={t.key} value={t.key}>
              {t.label}
            </Radio>
          ))}
        </Radio.Group>
      </Form.Item>
      <Form.Item label={AREA_ASSET_NAME} name='name' rules={[Rules.range(4, 50)]}>
        <Input placeholder={PLEASE_INPUT_AREA_ASSET_NAME} />
      </Form.Item>
      {parents?.length > 0 ? (
        <Form.Item
          label={AREA}
          name='parent_id'
          rules={[{ required: true, message: PLEASE_SELECT_AREA }]}
        >
          <Select placeholder={PLEASE_SELECT_AREA}>
            {parents.map(({ id, name, attributes }) => (
              <Select.Option key={id} value={id} attributes={attributes}>
                {name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      ) : (
        <Form.Item name='parent_id' hidden={true} initialValue={asset.parentId}></Form.Item>
      )}
      {children}
    </Form>
  );
};
