import { Form, Input, message, ModalProps, Select, Typography } from 'antd';
import { Project } from '../../types/project';
import { FC, useEffect, useState } from 'react';
import { CreateProjectRequest, UpdateProjectRequest } from '../../apis/project';
import intl from 'react-intl-universal';
import { FormInputItem } from '../../components/formInputItem';
import { ModalWrapper } from '../../components/modalWrapper';
import { useAppConfig } from '../../config';
import { ProjectType, useProjectTypeOptions } from '../../project';

export interface EditProjectModalProps extends ModalProps {
  project?: Project;
  onSuccess: () => void;
}

const EditProjectModal: FC<EditProjectModalProps> = (props) => {
  const { project, open, onSuccess } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();
  const appConfig = useAppConfig();
  const projectTypeOptions = useProjectTypeOptions();

  useEffect(() => {
    if (open) {
      if (project) {
        form.setFieldsValue({
          name: project.name,
          description: project.description
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          description: '',
          type: ProjectType.General
        });
      }
    }
  }, [open, form, project]);

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
    <ModalWrapper
      {...props}
      width={420}
      title={project ? intl.get('EDIT_PROJECT') : intl.get('CREATE_PROJECT')}
      okText={project ? intl.get('UPDATE') : intl.get('CREATE')}
      onOk={project ? onSave : onAdd}
      confirmLoading={isLoading}
    >
      <Form form={form} labelCol={{ span: 6 }}>
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
        {appConfig === 'windTurbinePro' && (
          <Form.Item label={intl.get('TYPE')} name='type'>
            <Select
              disabled={!!project}
              options={projectTypeOptions.map((o) => ({ ...o, label: intl.get(o.label) }))}
            />
          </Form.Item>
        )}
      </Form>
    </ModalWrapper>
  );
};

export default EditProjectModal;
