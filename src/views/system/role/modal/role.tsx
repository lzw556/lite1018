import { Form, Input, ModalProps } from 'antd';
import { FC } from 'react';
import intl from 'react-intl-universal';
import { ModalWrapper } from '../../../../components/modalWrapper';

export interface RoleModalProps extends ModalProps {
  form: any;
}

const RoleModal: FC<RoleModalProps> = (props) => {
  const { form } = props;

  return (
    <ModalWrapper {...props}>
      <Form form={form} labelCol={{ span: 6 }}>
        <Form.Item
          name='name'
          label={intl.get('ROLE_NAME')}
          rules={[{ required: true, message: intl.get('PLEASE_ENTER_ROLE_NAME') }]}
        >
          <Input placeholder={intl.get('ROLE_NAME')} />
        </Form.Item>
        <Form.Item name={'description'} label={intl.get('ROLE_DESCRIPTION')}>
          <Input placeholder={intl.get('ROLE_DESCRIPTION')} />
        </Form.Item>
      </Form>
    </ModalWrapper>
  );
};

export default RoleModal;
