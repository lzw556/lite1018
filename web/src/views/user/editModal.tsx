import {Form, Input, message, Modal} from "antd";
import {useState} from "react";
import {UpdateUserRequest} from "../../apis/user";
import {User} from "../../types/user";
import {MailOutlined, MobileOutlined} from "@ant-design/icons";

export interface EditUserProps {
    visible: boolean
    onCancel?: () => void
    onSuccess: () => void
    user: User
}

const EditModal = (props: EditUserProps) => {
    const {visible, onCancel, onSuccess, user} = props
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [form] = Form.useForm()

    const onSave = () => {
        setIsLoading(true)
        form.validateFields(["phone", "email"]).then(values => {
            UpdateUserRequest(user.id, {phone: values.phone, email: values.email}).then(res => {
                setIsLoading(false)
                if (res.code === 200) {
                    onSuccess()
                    message.success("保存成功").then()
                }
            })
        }).catch(e => {
            setIsLoading(false)
        })
    }

    return <Modal
        width={320}
        title="编辑用户"
        visible={visible}
        cancelText="取消"
        onCancel={onCancel}
        okText="保存"
        onOk={onSave}
        confirmLoading={isLoading}>

        <Form form={form}>
            <Form.Item name="phone" initialValue={user.phone} rules={[{required: true, message: "请输入手机号码"}]}>
                <Input prefix={<MobileOutlined />} placeholder="手机号码"/>
            </Form.Item>
            <Form.Item name="email" initialValue={user.email} rules={[{required: true, message: "请输入邮箱地址"}]}>
                <Input prefix={<MailOutlined />} placeholder="邮箱"/>
            </Form.Item>
        </Form>

    </Modal>
}

export default EditModal