import RoleModal from './role';
import { Form } from 'antd';
import { FC, useEffect, useState } from 'react';
import { AddRoleRequest } from '../../../../apis/role';
import intl from 'react-intl-universal';

export interface AddRoleModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const AddRoleModal: FC<AddRoleModalProps> = (props) => {
  const { open, onCancel, onSuccess } = props;
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({ description: '' });
    }
  }, [open, form]);

  const onAdd = () => {
    form.validateFields().then((values) => {
      setIsLoading(true);
      AddRoleRequest(values).then((_) => {
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
      title={intl.get('ADD_ROLE')}
      onOk={onAdd}
      onCancel={onCancel}
      confirmLoading={isLoading}
    />
  );
};

export default AddRoleModal;
