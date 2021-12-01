import {Form, Input, Modal} from "antd";
import {FC, useState} from "react";
import {UpdateMyPass} from "../../../apis/profile";

export interface EditPassProps {
    visible: boolean
    onCancel?: () => void
    onSuccess: () => void
}

const EditPassModal: FC<EditPassProps> = ({visible, onSuccess, onCancel}) => {
    const [form] = Form.useForm()
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const onSave = () => {
        form.validateFields().then(values => {
            setIsLoading(true)
            UpdateMyPass({old: values.pwd, new: values.confirmPwd}).then(_ => {
                setIsLoading(false)
                onSuccess()
            })
        }).catch(e => {
            setIsLoading(false)
        })
    }

    return <Modal width={400} visible={visible} title={"修改密码"} okText={"确定"} onOk={onSave} cancelText={"取消"}
                  onCancel={onCancel} confirmLoading={isLoading}>
        <Form form={form} labelCol={{span: 6}}>
            <Form.Item label={"原密码"} name="pwd" rules={[{required: true, message: "请输入原密码"}]}>
                <Input type={"password"} placeholder={"请输入原密码"}/>
            </Form.Item>
            <Form.Item label={"新密码"} name="newPwd" rules={[{required: true, message: "请输入新密码"}]}>
                <Input type={"password"} placeholder={"请输入新密码"}/>
            </Form.Item>
            <Form.Item label={"确认新密码"} name="confirmPwd"
                       rules={[{required: true, message: "请确认新密码"}, ({getFieldValue}) => ({
                           validator(_, value) {
                               if (!value || getFieldValue('newPwd') === value) {
                                   return Promise.resolve();
                               }
                               return Promise.reject(new Error("两次输入的密码不一致"));
                           }
                       })]}>
                <Input type={"password"} placeholder={"请确认新密码"}/>
            </Form.Item>
        </Form>
    </Modal>
}

export default EditPassModal