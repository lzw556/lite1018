import {Asset} from "../../types/asset";
import {Form, message} from "antd";
import {useEffect, useState} from "react";
import {UpdateAssetRequest} from "../../apis/asset";
import AssetModal from "./assetModal";

export interface EditAssetProps {
    visible: boolean
    asset: Asset
    onCancel?: () => void
    onSuccess: () => void
}

const EditModal = (props: EditAssetProps) => {
    const {visible, asset, onCancel, onSuccess} = props
    const [form] = Form.useForm()
    const [isLoading, setIsLoading] = useState<boolean>(false)

    useEffect(() => {
        if (visible) {
            form.setFieldsValue({
                name: asset.name
            })
        }
    }, [visible])

    const onSave = () => {
        setIsLoading(true)
        form.validateFields().then(values => {
            UpdateAssetRequest(asset.id, values.name).then(res => {
                setIsLoading(false)
                if (res.code === 200) {
                    onSuccess()
                    message.success("保存成功").then()
                }
            })
        }).catch(_ =>
            setIsLoading(false)
        )
    }

    return <AssetModal form={form} width={320} title={"资产编辑"} okText={"保存"} cancelText={"取消"}
                       visible={visible}
                       onCancel={onCancel}
                       onOk={onSave}
                       confirmLoading={isLoading}/>
}

export default EditModal