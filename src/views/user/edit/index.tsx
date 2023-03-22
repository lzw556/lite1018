import { Form, Input, Modal } from 'antd';
import { useEffect, useState } from 'react';
import { UpdateUserRequest } from '../../../apis/user';
import { User } from '../../../types/user';
import { Rules } from '../../../constants/validator';
import RoleSelect from '../../../components/roleSelect';
import intl from 'react-intl-universal';

export interface EditUserProps {
  visible: boolean;
  onCancel?: () => void;
  onSuccess: () => void;
  user: User;
}

const EditUserModal = (props: EditUserProps) => {
  const { visible, onCancel, onSuccess, user } = props;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        phone: user.phone,
        email: user.email,
        role: user.role
      });
    }
  }, [visible, user]);

  const onSave = () => {
    setIsLoading(true);
    form
      .validateFields()
      .then((values) => {
        UpdateUserRequest(user.id, values).then((_) => {
          setIsLoading(false);
          onSuccess();
        });
      })
      .catch((e) => {
        setIsLoading(false);
      });
  };

  return (
    <Modal
      width={420}
      title={intl.get('EDIT_USER')}
      visible={visible}
      cancelText={intl.get('CANCEL')}
      onCancel={onCancel}
      okText={intl.get('SAVE')}
      onOk={onSave}
      confirmLoading={isLoading}
    >
      <Form form={form} labelCol={{ span: 8 }}>
        {user.id !== 1 && (
          <Form.Item
            name={'role'}
            label={intl.get('USER_ROLE')}
            initialValue={user.role ? user.role : null}
            rules={[Rules.required]}
          >
            <RoleSelect placeholder={intl.get('PLEASE_SELECT_USER_ROLE')} />
          </Form.Item>
        )}
        <Form.Item name={'phone'} label={intl.get('CELLPHONE')} initialValue={user.phone}>
          <Input placeholder={intl.get('CELLPHONE')} />
        </Form.Item>
        <Form.Item name={'email'} label={intl.get('EMAIL')} initialValue={user.email}>
          <Input placeholder={intl.get('EMAIL')} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditUserModal;
