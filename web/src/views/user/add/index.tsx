import {Form, Input, Modal, Select} from "antd";
import "../../../App.css"
import {AddUserRequest} from "../../../apis/user";
import {useEffect, useState} from "react";
import {Rules} from "../../../constants/validator";
import RoleSelect from "../../../components/roleSelect";
import {GetProjectsRequest} from "../../../apis/project";

export interface AddUserProps {
    visible: boolean
    onCancel?: () => void
    onSuccess: () => void
}

const {Option} = Select;

const AddUserModal = (props: AddUserProps) => {

    const {visible, onCancel, onSuccess} = props
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [projects, setProjects] = useState<any>()
    const [form] = Form.useForm()

    useEffect(() => {
        if (visible) {
            form.resetFields()
        }
    }, [visible])

    const onAdd = () => {
        setIsLoading(true)
        form.validateFields().then(values => {
            console.log(values)
            AddUserRequest(values).then(_ => {
                setIsLoading(false)
                onSuccess()
            }).catch(e => {
                setIsLoading(false)
            })
        }).catch(e => {
            setIsLoading(false)
        })
    }

    const onSelectProjects = (open:any) => {
        if (open) {
            GetProjectsRequest().then(setProjects)
        }
    }

    return <Modal
        width={420}
        title="用户添加"
        visible={visible}
        cancelText="取消"
        onCancel={onCancel}
        okText="确认"
        onOk={onAdd}
        confirmLoading={isLoading}>

        <Form form={form} labelCol={{span: 6}}>
            <Form.Item name="username" label={"用户名"} rules={[{required: true, message: "请输入用户名"}]}>
                <Input placeholder="用户名"/>
            </Form.Item>
            <Form.Item name="password" label={"密码"} rules={[{required: true, message: "请输入密码"}]}>
                <Input.Password placeholder="密码"/>
            </Form.Item>
            <Form.Item name="confirmPwd" label={"确认密码"}
                       rules={[{required: true, message: "请确认密码"}, ({getFieldValue}) => ({
                           validator(_, value) {
                               if (!value || getFieldValue('password') === value) {
                                   return Promise.resolve();
                               }
                               return Promise.reject(new Error("两次输入的密码不一致"));
                           }
                       })]}>
                <Input.Password placeholder="确认密码"/>
            </Form.Item>
            <Form.Item name={"role"} label={"用户角色"} rules={[Rules.required]}>
                <RoleSelect placeholder={"请选择用户角色"}/>
            </Form.Item>
            <Form.Item name="phone" label={"手机号码"} initialValue={""}>
                <Input placeholder="手机号码"/>
            </Form.Item>
            <Form.Item name="email" label={"邮箱"} initialValue={""}>
                <Input placeholder="邮箱"/>
            </Form.Item>
            <Form.Item name={"projects"} label={"绑定项目"} initialValue={[]}>
                <Select mode="multiple" placeholder="请选择绑定项目" onDropdownVisibleChange={onSelectProjects}>
                    {
                        projects?.map((project:any) => <Option key={project.id} value={project.id}>{project.name}</Option>)
                    }
                </Select>
            </Form.Item>
        </Form>

    </Modal>
}

export default AddUserModal