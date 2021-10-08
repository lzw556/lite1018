import {Form, Input, message, Modal} from "antd";
import {useState} from "react";
import {useForm} from "antd/es/form/Form";
import {AddAssetRequest} from "../../apis/asset";

export interface AddAssetProps {
    visible: boolean
    onCancel?:() => void
    onSuccess:() => void
}

const AddModal = (props: AddAssetProps) => {
    const {visible, onCancel, onSuccess} = props
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [form] = useForm()

    const onAdd = async () => {
        setIsLoading(true)
        form.validateFields(["name"]).then(values => {
            AddAssetRequest(values.name).then(res => {
                setIsLoading(false)
                if (res.code === 200) {
                    message.success("添加成功").then()
                    onSuccess()
                }
            })
        }).catch(e => {
            setIsLoading(false)
        })
    }

    return <Modal
        width={320}
        title="添加资产"
        visible={visible}
        cancelText="取消"
        onCancel={onCancel}
        okText="确认"
        onOk={onAdd}
        confirmLoading={isLoading}>

        <Form form={form}>
            <Form.Item name="name" rules={[{required: true, message: "请输入资产名称"}]}>
                <Input placeholder="资产名称"/>
            </Form.Item>
        </Form>
    </Modal>
}

export default AddModal