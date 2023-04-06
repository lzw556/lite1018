import { Form, Input, Modal, Typography } from 'antd';
import { FC, useState } from 'react';
import { UpdateMyPass } from '../../../apis/profile';
import intl from 'react-intl-universal';

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
      <Form form={form} labelCol={{ span: 6 }}>
        <Form.Item
          label={
            <Typography.Text ellipsis={true} title={intl.get('OLD_PASSWORD')}>
              {intl.get('OLD_PASSWORD')}
            </Typography.Text>
          }
          name='pwd'
          rules={[{ required: true, message: intl.get('PLEASE_ENTER_OLD_PASSWORD') }]}
        >
          <Input type={'password'} placeholder={intl.get('PLEASE_ENTER_OLD_PASSWORD')} />
        </Form.Item>
        <Form.Item
          label={
            <Typography.Text ellipsis={true} title={intl.get('NEW_PASSWORD')}>
              {intl.get('NEW_PASSWORD')}
            </Typography.Text>
          }
          name='newPwd'
          rules={[{ required: true, message: intl.get('PLEASE_ENTER_NEW_PASSWORD') }]}
        >
          <Input type={'password'} placeholder={intl.get('PLEASE_ENTER_NEW_PASSWORD')} />
        </Form.Item>
        <Form.Item
          label={
            <Typography.Text ellipsis={true} title={intl.get('CONFIRM_PASSWORD')}>
              {intl.get('CONFIRM_PASSWORD')}
            </Typography.Text>
          }
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
