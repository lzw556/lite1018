import {Form, message} from "antd";
import {FC, useEffect, useState} from "react";
import {UpdateRoleRequest} from "../../../../apis/role";
import RoleModal from "./role";
import {Role} from "../../../../types/role";

export interface EditRoleModalProps {
    role?: Role
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

const EditRoleModal:FC<EditRoleModalProps> = (props) => {
    const {visible, role, onCancel, onSuccess} = props
    const [form] = Form.useForm()
    const [isLoading, setIsLoading] = useState<boolean>(false)

    useEffect(() => {
        if (visible) {
            form.setFieldsValue({
                name: role?.name,
                description:role?.description,
            })
        }
    }, [visible])

    const onSave = () => {
        if (role) {
            form.validateFields().then(values => {
                setIsLoading(true)
                UpdateRoleRequest(role.id, values).then(res => {
                    setIsLoading(false)
                    if (res.code === 200) {
                        message.success('修改成功').then()
                        onSuccess()
                    }else {
                        message.error(res.msg).then()
                    }
                })
            })
        }else {
            message.error("角色不存在").then()
        }
    }

    return <RoleModal form={form} width={420} visible={visible} title={"角色编辑"} onOk={onSave} onCancel={onCancel} confirmLoading={isLoading}/>
}

export default EditRoleModal