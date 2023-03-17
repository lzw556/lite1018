import { Form, Input, Modal, ModalProps, Select } from 'antd';
import * as React from 'react';
import { ROOT_ASSETS } from '../../../../config/assetCategory.config';
import { defaultValidateMessages, Rules } from '../../../../constants/validator';
import { addAsset } from '../../services';
import { Asset, AssetRow } from '../../types';
import {
  CREATE_GENERAL,
  PLEASE_INPUT_GENERAL_NAME,
  GENERAL_NAME,
  GENERAL_PARENT,
  PLEASE_SELECT_GENERAL_PARENT
} from '../common/types';

export const GeneralCreate: React.FC<
  ModalProps & { parents?: AssetRow[]; parentId?: number; onSuccess: () => void }
> = (props) => {
  const { parents = [], parentId, onSuccess } = props;
  const [form] = Form.useForm<Asset>();

  return (
    <Modal
      {...{
        title: CREATE_GENERAL,
        cancelText: '取消',
        okText: '添加',
        ...props,
        onOk: () => {
          form.validateFields().then((values) => {
            try {
              addAsset({ ...values, parent_id: values.parent_id || 0 }).then(() => {
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
        <Form.Item label={GENERAL_NAME} name='name' rules={[Rules.range(4, 50)]}>
          <Input placeholder={PLEASE_INPUT_GENERAL_NAME} />
        </Form.Item>
        <Form.Item name='type' hidden={true} initialValue={ROOT_ASSETS.get('general')}></Form.Item>
        {parents?.length > 0 ? (
          <Form.Item label={GENERAL_PARENT} name='parent_id'>
            <Select placeholder={PLEASE_SELECT_GENERAL_PARENT}>
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
