import { Form, Input, message, Modal, ModalProps, Typography } from 'antd';
import { Project } from '../../types/project';
import { FC, useEffect, useState } from 'react';
import { defaultValidateMessages } from '../../constants/validator';
import { CreateProjectRequest, UpdateProjectRequest } from '../../apis/project';
import intl from 'react-intl-universal';
import { FormInputItem } from '../../components/formInputItem';

export interface EditProjectModalProps extends ModalProps {
  project?: Project;
  onSuccess: () => void;
}

const EditProjectModal: FC<EditProjectModalProps> = (props) => {
  const { project, visible, onSuccess } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (project) {
        form.setFieldsValue({
          name: project.name,
          description: project.description
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          description: ''
        });
      }
    }
  }, [visible]);

  const onAdd = () => {
    form
      .validateFields()
      .then((values) => {
        setIsLoading(true);
        CreateProjectRequest(values)
          .then((_) => {
            setIsLoading(false);
            onSuccess();
          })
          .catch((_) => setIsLoading(false));
      })
      .finally(() => setIsLoading(false));
  };

  const onSave = () => {
    if (project) {
      form
        .validateFields()
        .then((values) => {
          setIsLoading(true);
          UpdateProjectRequest(project.id, values).then((_) => {
            setIsLoading(false);
            onSuccess();
          });
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
      message.error(intl.get('PROJECT_DOES_NOT_EXIST'));
    }
  };

  return (
    <Modal
      {...props}
      width={420}
      title={project ? intl.get('EDIT_PROJECT') : intl.get('CREATE_PROJECT')}
      okText={project ? intl.get('UPDATE') : intl.get('CREATE')}
      onOk={project ? onSave : onAdd}
      confirmLoading={isLoading}
    >
      <Form form={form} labelCol={{ span: 4 }} validateMessages={defaultValidateMessages}>
        <FormInputItem
          name='name'
          label={intl.get('NAME')}
          requiredMessage={intl.get('PLEASE_ENTER_PROJECT_NAME')}
          lengthLimit={{ min: 4, max: 32, label: intl.get('NAME').toLowerCase() }}
        >
          <Input placeholder={intl.get('PLEASE_ENTER_PROJECT_NAME')} />
        </FormInputItem>
        <Form.Item
          label={
            <Typography.Text ellipsis={true} title={intl.get('DESCRIPTION')}>
              {intl.get('DESCRIPTION')}
            </Typography.Text>
          }
          name={'description'}
        >
          <Input.TextArea placeholder={intl.get('PLEASE_ENTER_PROJECT_DESCRIPTION')} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditProjectModal;
