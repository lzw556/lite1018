import { Form, Input, Modal, ModalProps } from 'antd';
import * as React from 'react';
import { defaultValidateMessages, Rules } from '../../../../constants/validator';
import { addAsset } from '../../services';
import { Asset } from '../../types';
import { CREATE_AREA, PLEASE_INPUT_AREA_NAME, AREA_NAME, AREA_ASSET_TYPE_ID } from '../config';
import intl from 'react-intl-universal';

export const AreaCreate: React.FC<ModalProps & { onSuccess: () => void }> = (props) => {
  const { onSuccess } = props;
  const [form] = Form.useForm<Asset>();

  return (
    <Modal
      {...{
        title: intl.get(CREATE_AREA),
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
      <Form form={form} labelCol={{ span: 6 }} validateMessages={defaultValidateMessages}>
        <Form.Item label={intl.get(AREA_NAME)} name='name' rules={[Rules.range(4, 50)]}>
          <Input placeholder={intl.get(PLEASE_INPUT_AREA_NAME)} />
        </Form.Item>
        <Form.Item name='type' hidden={true} initialValue={AREA_ASSET_TYPE_ID}></Form.Item>
      </Form>
    </Modal>
  );
};
