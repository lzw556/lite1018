import { Form, Input, Modal, ModalProps, Radio, Select } from 'antd';
import * as React from 'react';
import { getAssets, updateAsset } from '../services';
import { Asset, AssetRow } from '../types';
import intl from 'react-intl-universal';
import { convertRow } from '../common/utils';
import { useAssetCategoryChain } from '../../../config/assetCategory.config';
import { FormInputItem } from '../../../components/formInputItem';

export const UpdateAreaAsset: React.FC<ModalProps & { asset: AssetRow; onSuccess: () => void }> = (
  props
) => {
  const { asset, onSuccess } = props;
  const {
    root: { key, label },
    last
  } = useAssetCategoryChain();
  const [form] = Form.useForm<Asset>();
  const [parents, setParents] = React.useState<AssetRow[]>([]);

  React.useEffect(() => {
    getAssets({ type: key, parent_id: 0 }).then(setParents);
  }, [key]);

  React.useEffect(() => {
    if (asset) {
      form.resetFields();
      const values = convertRow(asset);
      if (values) form.setFieldsValue(values);
    }
  }, [asset, form]);

  return (
    <Modal
      {...{
        title: intl.get('EDIT_SOMETHING', { something: intl.get(last.label) }),
        cancelText: intl.get('CANCEL'),
        okText: intl.get('SAVE'),
        ...props,
        onOk: () => {
          form.validateFields().then((values) => {
            try {
              updateAsset(asset.id, values).then(() => {
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
        <Form.Item
          label={intl.get('TYPE')}
          name='type'
          rules={[
            {
              required: true,
              message: intl.get('PLEASE_SELECT_SOMETHING', { something: intl.get('TYPE') })
            }
          ]}
        >
          <Radio.Group>
            {last.options?.map((t) => (
              <Radio key={t.key} value={t.key}>
                {intl.get(t.label)}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>
        <FormInputItem
          label={intl.get('NAME')}
          name='name'
          requiredMessage={intl.get('PLEASE_ENTER_NAME')}
          lengthLimit={{ min: 4, max: 50, label: intl.get('NAME').toLowerCase() }}
        >
          <Input placeholder={intl.get('PLEASE_ENTER_NAME')} />
        </FormInputItem>
        {parents?.length > 0 ? (
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
            <Select
              placeholder={intl.get('PLEASE_SELECT_SOMETHING', { something: intl.get(label) })}
            >
              {parents.map(({ id, name, attributes }) => (
                <Select.Option key={id} value={id} attributes={attributes}>
                  {name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        ) : (
          <Form.Item name='parent_id' hidden={true} initialValue={asset.parentId}>
            <Input />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};
