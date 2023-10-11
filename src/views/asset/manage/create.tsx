import { Form, Input, ModalProps, Select } from 'antd';
import * as React from 'react';
import { addAsset, getAssets } from '../services';
import { Asset, AssetRow } from '../types';
import intl from 'react-intl-universal';
import { useAssetCategoryChain } from '../../../config/assetCategory.config';
import { FormInputItem } from '../../../components/formInputItem';
import { getParents } from '../common/utils';
import { ModalWrapper } from '../../../components/modalWrapper';

export const CreateAsset: React.FC<ModalProps & { parentId?: number; onSuccess: () => void }> = (
  props
) => {
  const { parentId, onSuccess } = props;
  const [form] = Form.useForm<Asset>();
  const {
    root: { label, key, isChild }
  } = useAssetCategoryChain();
  const [parents, setParents] = React.useState<AssetRow[]>([]);
  React.useEffect(() => {
    if (parentId === undefined && isChild) {
      getAssets({ type: key, parent_id: 0 }).then((assets) => setParents(getParents(assets)));
    }
  }, [parentId, isChild, key]);

  return (
    <ModalWrapper
      {...{
        title: intl.get('CREATE_SOMETHING', { something: intl.get(label) }),
        okText: intl.get('CREATE'),
        ...props,
        onOk: () => {
          form.validateFields().then((values) => {
            try {
              addAsset({ ...values, parent_id: values.parent_id ?? parentId ?? 0 }).then(() => {
                onSuccess();
              });
            } catch (error) {
              console.log(error);
            }
          });
        }
      }}
    >
      <Form form={form} labelCol={{ span: 6 }}>
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
        {parents?.length > 0 && parentId === undefined ? (
          <Form.Item label={intl.get('PARENT_ASSET')} name='parent_id'>
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
          <Form.Item name='parent_id' hidden={true} initialValue={parentId}>
            <Input />
          </Form.Item>
        )}
      </Form>
    </ModalWrapper>
  );
};
