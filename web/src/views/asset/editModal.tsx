import {Asset} from "../../types/asset";
import {Form, Input, message, Modal} from "antd";
import {useState} from "react";
import {UpdateAssetRequest} from "../../apis/asset";

export interface EditAssetProps {
    visible: boolean
    asset: Asset
    onCancel?:() => void
    onSuccess:() => void
}

const EditModal = (props: EditAssetProps) => {
    const {visible, asset, onCancel, onSuccess} = props
    const [form] = Form.useForm()
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const onSave = () => {
        setIsLoading(true)
        form.validateFields().then(values=> {
            UpdateAssetRequest(asset.id, values.name).then(res => {
                setIsLoading(false)
                if (res.code === 200) {
                    onSuccess()
                    message.success("保存成功").then()
                }
            })
        }).catch(e =>
            setIsLoading(false)
        )
    }

    return <Modal
        width={320}
        title="编辑资产"
        visible={visible}
        cancelText="取消"
        onCancel={onCancel}
        okText="保存"
        onOk={onSave}
        confirmLoading={isLoading}>

        <Form form={form}>
            <Form.Item name="name" initialValue={asset.name} rules={[{required: true, message: "请输入资产名称"}]}>
                <Input placeholder="资产名称"/>
            </Form.Item>
        </Form>
    </Modal>
}

export default EditModal