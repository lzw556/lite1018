import { Form, Input, Modal, ModalProps, Select } from 'antd';
import * as React from 'react';
import { defaultValidateMessages, Rules } from '../../../../constants/validator';
import { addAsset, getAssets } from '../../services';
import { Asset, AssetRow } from '../../types';
import {
  CREATE_GENERAL,
  PLEASE_INPUT_GENERAL_NAME,
  GENERAL_NAME,
  GENERAL_PARENT,
  PLEASE_SELECT_GENERAL_PARENT,
  GENERAL_ASSET_TYPE_ID
} from '../config';
import intl from 'react-intl-universal';

export const GeneralCreate: React.FC<ModalProps & { parentId?: number; onSuccess: () => void }> = (
  props
) => {
  const { parentId, onSuccess } = props;
  const [parents, setParents] = React.useState<AssetRow[]>([]);
  const [form] = Form.useForm<Asset>();

  React.useEffect(() => {
    if (parentId === undefined) {
      getAssets({ type: GENERAL_ASSET_TYPE_ID }).then(setParents);
    }
  }, [parentId]);

  return (
    <Modal
      {...{
        title: intl.get(CREATE_GENERAL),
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
      <Form form={form} labelCol={{ span: 6 }} validateMessages={defaultValidateMessages}>
        <Form.Item label={intl.get(GENERAL_NAME)} name='name' rules={[Rules.range(4, 50)]}>
          <Input placeholder={intl.get(PLEASE_INPUT_GENERAL_NAME)} />
        </Form.Item>
        <Form.Item name='type' hidden={true} initialValue={GENERAL_ASSET_TYPE_ID}></Form.Item>
        {parents?.length > 0 && parentId === undefined ? (
          <Form.Item label={intl.get(GENERAL_PARENT)} name='parent_id'>
            <Select placeholder={intl.get(PLEASE_SELECT_GENERAL_PARENT)}>
              {parents.map(({ id, name, attributes }) => (
                <Select.Option key={id} value={id} attributes={attributes}>
                  {name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        ) : (
          <Form.Item name='parent_id' hidden={true} initialValue={parentId}></Form.Item>
        )}
      </Form>
    </Modal>
  );
};
