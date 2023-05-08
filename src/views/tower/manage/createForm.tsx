import { Form, FormInstance, Input, ModalProps, Select } from 'antd';
import React from 'react';
import { Asset, AssetCategoryKey, AssetRow, getAssets } from '../../asset';
import intl from 'react-intl-universal';
import { useAssetCategoryChain } from '../../../config/assetCategory.config';
import { FormInputItem } from '../../../components/formInputItem';

export const CreateForm: React.FC<
  ModalProps & {
    form: FormInstance<Asset>;
    parentId?: number;
  }
> = (props) => {
  const {
    root: { key, label }
  } = useAssetCategoryChain();
  const [parents, setParents] = React.useState<AssetRow[]>([]);
  const { form, parentId } = props;

  React.useEffect(() => {
    if (parentId === undefined) {
      getAssets({ type: key, parent_id: 0 }).then(setParents);
    }
  }, [parentId, key]);

  return (
    <Form form={form} labelCol={{ span: 6 }}>
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
      {parents.length > 0 && parentId === undefined ? (
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
      ) : (
        <Form.Item name='parent_id' hidden={true} initialValue={parentId}>
          <Input />
        </Form.Item>
      )}
      <Form.Item label={intl.get('INDEX_NUMBER')} name={['attributes', 'index']} initialValue={1}>
        <Select>
          {[1, 2, 3, 4, 5].map((item) => (
            <Select.Option key={item} value={item}>
              {item}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </Form>
  );
};
