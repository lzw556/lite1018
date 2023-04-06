import { Form } from 'antd';
import { FC, useEffect, useState } from 'react';
import { UpdateRoleRequest } from '../../../../apis/role';
import RoleModal from './role';
import { Role } from '../../../../types/role';
import intl from 'react-intl-universal';

export interface EditRoleModalProps {
  role: Role;
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const EditRoleModal: FC<EditRoleModalProps> = (props) => {
  const { open, role, onCancel, onSuccess } = props;
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        name: role?.name,
        description: role?.description
      });
    }
  }, [open, form, role]);

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
      open={open}
      title={intl.get('EDIT_ROLE')}
      onOk={onSave}
      onCancel={onCancel}
      confirmLoading={isLoading}
    />
  );
};

export default EditRoleModal;
