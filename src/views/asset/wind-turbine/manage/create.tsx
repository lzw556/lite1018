import { Form, Input, Modal, ModalProps } from 'antd';
import * as React from 'react';
import { ROOT_ASSETS } from '../../../../config/assetCategory.config';
import { defaultValidateMessages, Rules } from '../../../../constants/validator';
import { addAsset } from '../../services';
import { Asset } from '../../types';
import {
  CREATE_WIND_TURBINE,
  PLEASE_INPUT_WIND_TURBINE_NAME,
  WIND_TURBINE_NAME
} from '../common/types';

export const WindTurbineCreate: React.FC<ModalProps & { onSuccess: () => void }> = (props) => {
  const { onSuccess } = props;
  const [form] = Form.useForm<Asset>();

  return (
    <Modal
      {...{
        title: CREATE_WIND_TURBINE,
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
        <Form.Item label={WIND_TURBINE_NAME} name='name' rules={[Rules.range(4, 50)]}>
          <Input placeholder={PLEASE_INPUT_WIND_TURBINE_NAME} />
        </Form.Item>
        <Form.Item
          name='type'
          hidden={true}
          initialValue={ROOT_ASSETS.get('windTurbine')}
        ></Form.Item>
      </Form>
    </Modal>
  );
};
