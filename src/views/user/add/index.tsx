import { Form, Input, Modal, Select, Typography } from 'antd';
import '../../../App.css';
import { AddUserRequest } from '../../../apis/user';
import { useEffect, useState } from 'react';
import RoleSelect from '../../../components/roleSelect';
import { GetProjectsRequest } from '../../../apis/project';
import intl from 'react-intl-universal';
import { FormInputItem } from '../../../components/formInputItem';

export interface AddUserProps {
  visible: boolean;
  onCancel?: () => void;
  onSuccess: () => void;
}

const { Option } = Select;

const AddUserModal = (props: AddUserProps) => {
  const { visible, onCancel, onSuccess } = props;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [projects, setProjects] = useState<any>();
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      form.resetFields();
    }
  }, [visible]);

  const onAdd = () => {
    setIsLoading(true);
    form
      .validateFields()
      .then((values) => {
        console.log(values);
        AddUserRequest(values)
          .then((_) => {
            setIsLoading(false);
            onSuccess();
          })
          .catch((e) => {
            setIsLoading(false);
          });
      })
      .catch((e) => {
        setIsLoading(false);
      });
  };

  const onSelectProjects = (open: any) => {
    if (open) {
      GetProjectsRequest().then(setProjects);
    }
  };

  return (
    <Modal
      width={420}
      title={intl.get('CREATE_USER')}
      visible={visible}
      cancelText={intl.get('CANCEL')}
      onCancel={onCancel}
      okText={intl.get('OK')}
      onOk={onAdd}
      confirmLoading={isLoading}
    >
      <Form form={form} labelCol={{ span: 6 }}>
        <FormInputItem
          name='username'
          label={intl.get('USERNAME')}
          requiredMessage={intl.get('PLEASE_INPUT_USERNAME')}
          lengthLimit={{ min: 4, max: 16, label: intl.get('USERNAME').toLowerCase() }}
        >
          <Input placeholder={intl.get('USERNAME')} />
        </FormInputItem>
        <Form.Item
          name='password'
          label={intl.get('PASSWORD')}
          rules={[{ required: true, message: intl.get('PLEASE_INPUT_PASSWORD') }]}
        >
          <Input.Password placeholder={intl.get('PASSWORD')} />
        </Form.Item>
        <Form.Item
          name='confirmPwd'
          label={
            <Typography.Text ellipsis={true} title={intl.get('CONFIRM_PASSWORD')}>
              {intl.get('CONFIRM_PASSWORD')}
            </Typography.Text>
          }
          rules={[
            { required: true, message: intl.get('PLEASE_CONFIRM_PASSWORD') },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error(intl.get('PASSWORDS_ARE_INCONSISTENT')));
              }
            })
          ]}
        >
          <Input.Password placeholder={intl.get('CONFIRM_PASSWORD')} />
        </Form.Item>
        <Form.Item
          name={'role'}
          label={intl.get('USER_ROLE')}
          rules={[{ required: true, message: intl.get('PLEASE_SELECT_USER_ROLE') }]}
        >
          <RoleSelect placeholder={intl.get('PLEASE_SELECT_USER_ROLE')} />
        </Form.Item>
        <Form.Item name='phone' label={intl.get('CELLPHONE')} initialValue={''}>
          <Input placeholder={intl.get('CELLPHONE')} />
        </Form.Item>
        <Form.Item name='email' label={intl.get('EMAIL')} initialValue={''}>
          <Input placeholder={intl.get('EMAIL')} />
        </Form.Item>
        <Form.Item name={'projects'} label={intl.get('BIND_PROJECT')} initialValue={[]}>
          <Select
            mode='multiple'
            placeholder={intl.get('PLEASE_SELECT_PROJECT_BOUND')}
            onDropdownVisibleChange={onSelectProjects}
          >
            {projects?.map((project: any) => (
              <Option key={project.id} value={project.id}>
                {project.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddUserModal;
