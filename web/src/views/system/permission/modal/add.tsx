import PermissionModal from "./permission";
import {Form, message} from "antd";
import {FC, useEffect, useState} from "react";
import {AddPermissionRequest} from "../../../../apis/permission";

export interface AddPermissionProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

const AddPermissionModal:FC<AddPermissionProps> = (props) => {
    const {visible, onCancel, onSuccess} = props
    const [form] = Form.useForm()
    const [isLoading, setIsLoading] = useState<boolean>(false)

    useEffect(() => {
        if (visible) {
            form.resetFields()
        }
    }, [visible])

    const onAdd = () => {
        form.validateFields().then(values => {
            setIsLoading(true)
            AddPermissionRequest(values).then(res => {
                setIsLoading(false)
                if (res.code === 200) {
                    message.success('添加成功').then()
                    onSuccess()
                }else {
                    message.error(res.msg).then()
                }
            })
        })
    }

    return <PermissionModal form={form} width={420} visible={visible} title={"权限添加"} onOk={onAdd} onCancel={onCancel} confirmLoading={isLoading}/>
}

export default AddPermissionModal;