import { Form, Input, Modal, ModalProps, Radio, Select } from 'antd';
import * as React from 'react';
import { addAsset, getAssets } from '../services';
import { Asset, AssetRow } from '../types';
import intl from 'react-intl-universal';
import { useAssetCategoryChain } from '../../../config/assetCategory.config';
import { FormInputItem } from '../../../components/formInputItem';

export const CreateAreaAsset: React.FC<
  ModalProps & { parentId?: number; onSuccess: () => void }
> = (props) => {
  const { parentId, onSuccess } = props;
  const {
    root: { key, label },
    last
  } = useAssetCategoryChain();
  const [parents, setParents] = React.useState<AssetRow[]>([]);
  const [form] = Form.useForm<Asset>();

  React.useEffect(() => {
    if (parentId === undefined) {
      getAssets({ type: key, parent_id: 0 }).then(setParents);
    }
  }, [parentId, key]);

  return (
    <Modal
      {...{
        title: intl.get('CREATE_SOMETHING', { something: intl.get('ASSET') }),
        cancelText: intl.get('CANCEL'),
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
            {last.map((t) => (
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
        {parents?.length > 0 && parentId === undefined ? (
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
          <Form.Item name='parent_id' hidden={true} initialValue={parentId}>
            <Input />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};
