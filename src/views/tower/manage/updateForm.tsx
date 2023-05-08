import { Form, FormInstance, Input, Select } from 'antd';
import React from 'react';
import { FormInputItem } from '../../../components/formInputItem';
import { Asset, AssetCategoryKey, AssetRow, getAssets } from '../../asset';
import intl from 'react-intl-universal';
import { convertRow } from '../../asset/common/utils';
import { useAssetCategoryChain } from '../../../config/assetCategory.config';

export const UpdateForm = ({
  tower,
  form,
  children,
  style
}: {
  tower: AssetRow;
  form: FormInstance<Asset>;
  children?: JSX.Element;
  style?: React.CSSProperties;
}) => {
  const {
    root: { key, label }
  } = useAssetCategoryChain();
  const [parents, setParents] = React.useState<AssetRow[]>([]);

  React.useEffect(() => {
    getAssets({ type: key, parent_id: 0 }).then(setParents);
  }, [key, tower.id]);

  React.useEffect(() => {
    if (tower) {
      form.resetFields();
      const values = convertRow(tower);
      if (values) form.setFieldsValue(values);
    }
  }, [tower, form]);

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
      <Form.Item name='type' hidden={true} initialValue={AssetCategoryKey.TOWER}>
        <Input />
      </Form.Item>
      <Form.Item
        label={intl.get(label)}
        name='parent_id'
        rules={[
          {
            required: true,
            message: intl.get('PLEASE_SELECT_SOMETHING', { something: intl.get(label) })
          }
        ]}
      >
        <Select placeholder={intl.get('PLEASE_SELECT_SOMETHING', { something: intl.get(label) })}>
          {parents.map(({ id, name }) => (
            <Select.Option key={id} value={id}>
              {name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item label={intl.get('INDEX_NUMBER')} name={['attributes', 'index']} initialValue={1}>
        <Select>
          {[1, 2, 3, 4, 5].map((item) => (
            <Select.Option key={item} value={item}>
              {item}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      {children}
    </Form>
  );
};
