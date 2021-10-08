import {Form, Input, message, Modal} from "antd";
import "../../../App.css"
import {AddUserRequest} from "../../../apis/user";
import {useState} from "react";
import {KeyOutlined, LockOutlined, MailOutlined, MobileOutlined, UserOutlined} from "@ant-design/icons";

export interface AddUserProps {
    visible: boolean
    onCancel?: () => void
    onSuccess: () => void
}

const AddUserModal = (props: AddUserProps) => {

    const {visible, onCancel, onSuccess} = props
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [form] = Form.useForm()

    const onAdd = () => {
        setIsLoading(true)
        form.validateFields(['username', 'password', 'confirmPwd']).then(values => {
            AddUserRequest({username: values.username, password: values.confirmPwd}).then(res => {
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
        width={320}
        title="添加用户"
        visible={visible}
        cancelText="取消"
        onCancel={onCancel}
        okText="确认"
        onOk={onAdd}
        confirmLoading={isLoading}>

        <Form form={form}>
            <Form.Item name="username" rules={[{required: true, message: "请输入用户名"}]}>
                <Input prefix={<UserOutlined />} placeholder="用户名"/>
            </Form.Item>
            <Form.Item name="password" rules={[{required: true, message: "请输入密码"}]}>
                <Input.Password prefix={<KeyOutlined />} placeholder="密码"/>
            </Form.Item>
            <Form.Item name="confirmPwd" rules={[{required: true, message: "请确认密码"}, ({getFieldValue}) => ({
                validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                    }
                    return Promise.reject(new Error("两次输入的密码不一致"));
                }
            })]}>
                <Input.Password prefix={<LockOutlined />} placeholder="确认密码"/>
            </Form.Item>
            <Form.Item name="phone">
                <Input prefix={<MobileOutlined />} placeholder="手机号码"/>
            </Form.Item>
            <Form.Item name="email">
                <Input prefix={<MailOutlined />} placeholder="邮箱"/>
            </Form.Item>
        </Form>

    </Modal>
}

export default AddUserModal