import { Form, Input, Select } from 'antd';
import { FormInstance } from 'antd/lib/form/Form';
import React from 'react';
import { Asset, AssetRow } from '../types';
import intl from 'react-intl-universal';
import { convertRow, getParents } from '../common/utils';
import { getAssets } from '../services';
import { useAssetCategoryChain } from '../../../config/assetCategory.config';
import { FormInputItem } from '../../../components/formInputItem';

export const UpdateAssetForm = ({
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
  const {
    root: { key }
  } = useAssetCategoryChain();
  const [parents, setParents] = React.useState<AssetRow[]>([]);

  React.useEffect(() => {
    if (asset.parentId !== 0) {
      getAssets({ type: key, parent_id: 0 }).then((assets) =>
        setParents(getParents(assets, undefined, asset.id))
      );
    }
  }, [asset.parentId, key, asset.id]);

  React.useEffect(() => {
    if (asset) {
      form.resetFields();
      const values = convertRow(asset);
      if (values) form.setFieldsValue(values);
    }
  }, [asset, form]);

  return (
    <Form form={form} labelCol={{ span: 6 }} style={style}>
      <FormInputItem
        label={intl.get('NAME')}
        name='name'
        requiredMessage={intl.get('PLEASE_ENTER_NAME')}
        lengthLimit={{ min: 4, max: 50, label: intl.get('NAME').toLowerCase() }}
      >
        <Input placeholder={intl.get('PLEASE_ENTER_NAME')} />
      </FormInputItem>
      <Form.Item name='type' hidden={true} initialValue={key}>
        <Input />
      </Form.Item>
      {asset.parentId !== 0 && parents.length > 0 ? (
        <Form.Item
          label={intl.get('PARENT_ASSET')}
          name='parent_id'
          rules={[
            {
              required: true,
              message: intl.get('PLEASE_SELECT_SOMETHING', {
                something: intl.get('PARENT_ASSET')
              })
            }
          ]}
        >
          <Select
            placeholder={intl.get('PLEASE_SELECT_SOMETHING', {
              something: intl.get('PARENT_ASSET')
            })}
          >
            {parents.map(({ id, name, attributes }) => (
              <Select.Option key={id} value={id} attributes={attributes}>
                {name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      ) : (
        <Form.Item name='parent_id' hidden={true} initialValue={0}>
          <Input />
        </Form.Item>
      )}
      {children}
    </Form>
  );
};
