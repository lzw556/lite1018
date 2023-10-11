import { Form, Input, Modal } from 'antd';
import { FC, useState } from 'react';
import { UpdateMyPass } from '../../../apis/profile';
import intl from 'react-intl-universal';
import { useLocaleFormLayout } from '../../../hooks/useLocaleFormLayout';

export interface EditPassProps {
  open: boolean;
  onCancel?: () => void;
  onSuccess: () => void;
}

const EditPassModal: FC<EditPassProps> = ({ open, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSave = () => {
    form
      .validateFields()
      .then((values) => {
        setIsLoading(true);
        UpdateMyPass({ old: values.pwd, new: values.confirmPwd }).then((_) => {
          setIsLoading(false);
          onSuccess();
        });
      })
      .catch((e) => {
        setIsLoading(false);
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <Modal
      width={420}
      open={open}
      title={intl.get('MODIFY_PASSWORD')}
      okText={intl.get('OK')}
      onOk={onSave}
      cancelText={intl.get('CANCEL')}
      onCancel={onCancel}
      confirmLoading={isLoading}
    >
      <Form form={form} {...useLocaleFormLayout()}>
        <Form.Item
          label={intl.get('OLD_PASSWORD')}
          name='pwd'
          rules={[{ required: true, message: intl.get('PLEASE_ENTER_OLD_PASSWORD') }]}
        >
          <Input type={'password'} placeholder={intl.get('PLEASE_ENTER_OLD_PASSWORD')} />
        </Form.Item>
        <Form.Item
          label={intl.get('NEW_PASSWORD')}
          name='newPwd'
          rules={[{ required: true, message: intl.get('PLEASE_ENTER_NEW_PASSWORD') }]}
        >
          <Input type={'password'} placeholder={intl.get('PLEASE_ENTER_NEW_PASSWORD')} />
        </Form.Item>
        <Form.Item
          label={intl.get('CONFIRM_PASSWORD')}
          name='confirmPwd'
          rules={[
            { required: true, message: intl.get('PLEASE_CONFIRM_PASSWORD') },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPwd') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error(intl.get('PASSWORDS_ARE_INCONSISTENT')));
              }
            })
          ]}
        >
          <Input type={'password'} placeholder={intl.get('PLEASE_CONFIRM_PASSWORD')} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditPassModal;
