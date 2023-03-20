import { Form, Input, Modal, ModalProps } from 'antd';
import * as React from 'react';
import { defaultValidateMessages, Rules } from '../../../../constants/validator';
import { addAsset } from '../../services';
import { Asset } from '../../types';
import {
  CREATE_HYDRO_TURBINE,
  PLEASE_INPUT_HYDRO_TURBINE_NAME,
  HYDRO_TURBINE_ASSET_TYPE_ID,
  HYDRO_TURBINE_NAME
} from '../config';

export const WindTurbineCreate: React.FC<ModalProps & { onSuccess: () => void }> = (props) => {
  const { onSuccess } = props;
  const [form] = Form.useForm<Asset>();

  return (
    <Modal
      {...{
        title: CREATE_HYDRO_TURBINE,
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
        <Form.Item label={HYDRO_TURBINE_NAME} name='name' rules={[Rules.range(4, 50)]}>
          <Input placeholder={PLEASE_INPUT_HYDRO_TURBINE_NAME} />
        </Form.Item>
        <Form.Item name='type' hidden={true} initialValue={HYDRO_TURBINE_ASSET_TYPE_ID}></Form.Item>
      </Form>
    </Modal>
  );
};
