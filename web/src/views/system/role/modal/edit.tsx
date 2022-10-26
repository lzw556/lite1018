import { Form } from 'antd';
import { FC, useEffect, useState } from 'react';
import { UpdateRoleRequest } from '../../../../apis/role';
import RoleModal from './role';
import { Role } from '../../../../types/role';

export interface EditRoleModalProps {
  role: Role;
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const EditRoleModal: FC<EditRoleModalProps> = (props) => {
  const { visible, role, onCancel, onSuccess } = props;
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        name: role?.name,
        description: role?.description
      });
    }
  }, [visible]);

  const onSave = () => {
    form.validateFields().then((values) => {
      setIsLoading(true);
      UpdateRoleRequest(role.id, values).then((_) => {
        setIsLoading(false);
        onSuccess();
      });
    });
  };

  return (
    <RoleModal
      form={form}
      width={420}
      visible={visible}
      title={'角色编辑'}
      onOk={onSave}
      onCancel={onCancel}
      confirmLoading={isLoading}
    />
  );
};

export default EditRoleModal;
