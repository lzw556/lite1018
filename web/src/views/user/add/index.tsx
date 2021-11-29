import {Form, Input, message, Modal} from "antd";
import "../../../App.css"
import {AddUserRequest} from "../../../apis/user";
import {useEffect, useState} from "react";
import {Rules} from "../../../constants/validator";
import RoleSelect from "../../../components/roleSelect";

export interface AddUserProps {
    visible: boolean
    onCancel?: () => void
    onSuccess: () => void
}

const AddUserModal = (props: AddUserProps) => {

    const {visible, onCancel, onSuccess} = props
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [form] = Form.useForm()

    useEffect(() => {
        if (visible) {
            form.resetFields()
        }
    }, [visible])

    const onAdd = () => {
        setIsLoading(true)
        form.validateFields(['username', 'password', 'confirmPwd', 'role']).then(values => {
            AddUserRequest(values).then(res => {
                setIsLoading(false)
                if (res.code === 200) {
                    onSuccess()
                    message.success("添加成功").then()
                }
            })
        }).catch(e => {
            setIsLoading(false)
        })
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
            <Form.Item name="confirmPwd" label={"确认密码"} rules={[{required: true, message: "请确认密码"}, ({getFieldValue}) => ({
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
                <RoleSelect placeholder={"请选择用户角色"} />
            </Form.Item>
            <Form.Item name="phone" label={"手机号码"}>
                <Input placeholder="手机号码"/>
            </Form.Item>
            <Form.Item name="email" label={"邮箱"}>
                <Input placeholder="邮箱"/>
            </Form.Item>
        </Form>

    </Modal>
}

export default AddUserModal