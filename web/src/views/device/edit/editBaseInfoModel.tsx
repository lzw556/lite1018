import {Form, Input, Modal} from "antd";
import {useEffect, useState} from "react";
import {UpdateDeviceRequest} from "../../../apis/device";

const EditBaseInfoModel = (props: any) => {
    const {visible, device, onCancel, onSuccess} = props
    const [form] = Form.useForm()
    const [isLoading, setIsLoading] = useState<boolean>(false)

    useEffect(() => {
        if (visible) {
            form.setFieldsValue({
                name: device.name
            })
        }
    }, [visible])

    const onSave = () => {
        form.validateFields().then(values => {
            setIsLoading(true)
            UpdateDeviceRequest(device.id, values.name).then(_ => {
                setIsLoading(false)
                onSuccess()
            })
        })
    }

    useEffect(() => {
        if (device && visible) {
            form.setFieldsValue({name: device.name})
        }
    }, [device])

    return <Modal width={420} visible={visible} title={"设备配置"} okText={"更新"} onOk={onSave} cancelText={"取消"}
                  onCancel={onCancel} confirmLoading={isLoading}>
        <Form form={form} labelCol={{span: 8}}>
            <Form.Item label={"设备名称"} name="name">
                <Input placeholder={"请输入设备名称"}/>
            </Form.Item>
        </Form>
    </Modal>
}

export default EditBaseInfoModel