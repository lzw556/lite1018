import { Form, Input, Modal, ModalProps } from 'antd';
import * as React from 'react';
import { defaultValidateMessages, Rules } from '../../../../constants/validator';
import { addAsset } from '../../services';
import { Asset } from '../../types';
import {
  CREATE_WIND_TURBINE,
  PLEASE_INPUT_WIND_TURBINE_NAME,
  WIND_TURBINE_ASSET_TYPE_ID,
  WIND_TURBINE_NAME
} from '../config';
import intl from 'react-intl-universal';

export const WindTurbineCreate: React.FC<ModalProps & { onSuccess: () => void }> = (props) => {
  const { onSuccess } = props;
  const [form] = Form.useForm<Asset>();

  return (
    <Modal
      {...{
        title: intl.get(CREATE_WIND_TURBINE),
        cancelText: intl.get('CANCEL'),
        okText: intl.get('CREATE'),
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
      <Form form={form} labelCol={{ span: 8 }} validateMessages={defaultValidateMessages}>
        <Form.Item label={intl.get(WIND_TURBINE_NAME)} name='name' rules={[Rules.range(4, 50)]}>
          <Input placeholder={intl.get(PLEASE_INPUT_WIND_TURBINE_NAME)} />
        </Form.Item>
        <Form.Item name='type' hidden={true} initialValue={WIND_TURBINE_ASSET_TYPE_ID}></Form.Item>
      </Form>
    </Modal>
  );
};
