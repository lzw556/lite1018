import {Form, Input, message, Modal, ModalProps} from "antd";
import {Project} from "../../types/project";
import {FC, useEffect, useState} from "react";
import {defaultValidateMessages, Rules} from "../../constants/validator";
import {CreateProjectRequest, UpdateProjectRequest} from "../../apis/project";

export interface EditProjectModalProps extends ModalProps{
    project?: Project;
    onSuccess: () => void
}

const EditProjectModal:FC<EditProjectModalProps> = (props) => {
    const {project, visible, onSuccess} = props;
    const [isLoading, setIsLoading] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            if (project) {
                form.setFieldsValue({
                    name: project.name,
                    description: project.description,
                });
            }else {
                form.resetFields();
                form.setFieldsValue({
                    description: '',
                });
            }
        }
    }, [visible]);

    const onAdd = () => {
        setIsLoading(true);
        form.validateFields().then(values => {
            CreateProjectRequest(values).then(_ => {
                setIsLoading(false);
                onSuccess()
            }).catch( _ => setIsLoading(false));
        });
    }

    const onSave = () => {
        setIsLoading(true);
        if (project) {
            form.validateFields().then(values => {
                UpdateProjectRequest(project.id, values).then(_ => {
                    setIsLoading(false);
                    onSuccess()
                })
            });
        }else {
            setIsLoading(false);
            message.error("项目不存在");
        }
    }

    return <Modal {...props} width={420}
                  title={project ? "项目编辑": "项目添加"}
                  okText={project ? "更新": "添加"}
                  onOk={project ? onSave : onAdd}
                  confirmLoading={isLoading}>
        <Form form={form} labelCol={{span: 4}} validateMessages={defaultValidateMessages}>
            <Form.Item label={"名称"} name={"name"} rules={[Rules.range(4, 32)]}>
                <Input placeholder={"请输入项目名称"}/>
            </Form.Item>
            <Form.Item label={"描述"} name={"description"}>
                <Input.TextArea placeholder={"请输入项目描述"}/>
            </Form.Item>
        </Form>
    </Modal>
};

export default EditProjectModal;