import {Form, Input, message, Modal} from "antd";
import {useEffect, useState} from "react";
import {UpdateUserRequest} from "../../../apis/user";
import {User} from "../../../types/user";
import {Rules} from "../../../constants/validator";
import RoleSelect from "../../../components/roleSelect";

export interface EditUserProps {
    visible: boolean
    onCancel?: () => void
    onSuccess: () => void
    user: User
}

const EditUserModal = (props: EditUserProps) => {
    const {visible, onCancel, onSuccess, user} = props
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [form] = Form.useForm()

    useEffect(() => {
        if (visible) {
            form.resetFields()
            form.setFieldsValue({
                email: user.email,
                phone: user.phone,
                role: user.role ? user.role : null
            })
        }
    }, [visible])

    const onSave = () => {
        setIsLoading(true)
        form.validateFields(["role"]).then(values => {
            UpdateUserRequest(user.id, values).then(res => {
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
        width={420}
        title="用户编辑"
        visible={visible}
        cancelText="取消"
        onCancel={onCancel}
        okText="保存"
        onOk={onSave}
        confirmLoading={isLoading}>

        <Form form={form} labelCol={{span: 8}}>
            {
                user.id !== 1 &&
                <Form.Item name={"role"} label={"用户角色"} initialValue={user.role ? user.role : null} rules={[Rules.required]}>
                    <RoleSelect placeholder={"请选择角色"}/>
                </Form.Item>
            }
            <Form.Item name="phone" label={"手机号码"} initialValue={user.phone}
                       rules={[{required: true, message: "请输入手机号码"}]}>
                <Input placeholder="手机号码"/>
            </Form.Item>
            <Form.Item name="email" label={"邮箱"} initialValue={user.email}
                       rules={[{required: true, message: "请输入邮箱地址"}]}>
                <Input placeholder="邮箱"/>
            </Form.Item>
        </Form>

    </Modal>
}

export default EditUserModal