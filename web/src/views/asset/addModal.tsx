import {message} from "antd";
import {useEffect, useState} from "react";
import {useForm} from "antd/es/form/Form";
import {AddAssetRequest} from "../../apis/asset";
import AssetModal from "./assetModal";

export interface AddAssetProps {
    visible: boolean
    onCancel?:() => void
    onSuccess:() => void
}

const AddModal = (props: AddAssetProps) => {
    const {visible, onCancel, onSuccess} = props
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [form] = useForm()

    useEffect(() => {
        if (visible) {
            form.resetFields()
        }
    }, [visible])

    const onAdd = () => {
        setIsLoading(true)
        form.validateFields(["name"]).then(values => {
            AddAssetRequest(values.name).then(res => {
                setIsLoading(false)
                if (res.code === 200) {
                    message.success("添加成功").then()
                    onSuccess()
                }
            })
        }).catch(_ => {
            setIsLoading(false)
        })
    }

    return <AssetModal form={form} width={320} title={"资产添加"}
                       visible={visible}
                       okText={"确定"}
                       cancelText={"取消"}
                       onOk={onAdd}
                       onCancel={onCancel}
                       confirmLoading={isLoading}/>
}

export default AddModal