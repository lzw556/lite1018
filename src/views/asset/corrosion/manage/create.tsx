import { Form, Input, Modal, ModalProps } from 'antd';
import * as React from 'react';
import { defaultValidateMessages, Rules } from '../../../../constants/validator';
import { addAsset } from '../../services';
import { Asset } from '../../types';
import { CREATE_AREA, PLEASE_INPUT_AREA_NAME, AREA_NAME, AREA_ASSET_TYPE_ID } from '../config';

export const AreaCreate: React.FC<ModalProps & { onSuccess: () => void }> = (props) => {
  const { onSuccess } = props;
  const [form] = Form.useForm<Asset>();

  return (
    <Modal
      {...{
        title: CREATE_AREA,
        cancelText: '取消',
        okText: '添加',
        ...props,
        onOk: () => {
          form.validateFields().then((values) => {
            try {
              addAsset(values).then(() => {
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
        <Form.Item label={AREA_NAME} name='name' rules={[Rules.range(4, 50)]}>
          <Input placeholder={PLEASE_INPUT_AREA_NAME} />
        </Form.Item>
        <Form.Item name='type' hidden={true} initialValue={AREA_ASSET_TYPE_ID}></Form.Item>
      </Form>
    </Modal>
  );
};
