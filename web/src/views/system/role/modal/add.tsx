import RoleModal from "./role";
import {Form} from "antd";
import {FC, useEffect, useState} from "react";
import {AddRoleRequest} from "../../../../apis/role";

export interface AddRoleModalProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

const AddRoleModal: FC<AddRoleModalProps> = (props) => {
    const {visible, onCancel, onSuccess} = props
    const [form] = Form.useForm()
    const [isLoading, setIsLoading] = useState<boolean>(false)

    useEffect(() => {
        if (visible) {
            form.resetFields()
            form.setFieldsValue({description: ''})
        }
    }, [visible])

    const onAdd = () => {
        form.validateFields().then(values => {
            setIsLoading(true)
            AddRoleRequest(values).then(_ => {
                setIsLoading(false)
                onSuccess()
            })
        })
    }

    return <RoleModal form={form} width={420} visible={visible} title={"角色添加"} onOk={onAdd} onCancel={onCancel}
                      confirmLoading={isLoading}/>
}

export default AddRoleModal