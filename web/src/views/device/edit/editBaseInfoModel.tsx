import {Form, Input, Modal} from "antd";
import {useEffect, useState} from "react";
import {DeviceType} from "../../../types/device_type";
import {UpdateDeviceRequest} from "../../../apis/device";
import AssetSelect from "../../../components/assetSelect";

const EditBaseInfoModel = (props: any) => {
    const {visible, device, onCancel, onSuccess} = props
    const [form] = Form.useForm()
    const [isLoading, setIsLoading] = useState<boolean>(false)

    useEffect(() => {
        if (visible) {
            form.setFieldsValue({
                asset: device.asset.id,
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

    const renderFormItem = () => {
        if (device && visible) {
            switch (device.typeId) {
                case DeviceType.Gateway:
                    return <Form.Item label={"所属资产"} name={"asset"}>
                        <AssetSelect/>
                    </Form.Item>
                case DeviceType.NormalTemperatureCorrosion:
                case DeviceType.HighTemperatureCorrosion:
                case DeviceType.BoltLoosening:
                case DeviceType.BoltElongation:
                case DeviceType.Router:
            }
        }
    }

    useEffect(() => {
        if (device && visible) {
            form.setFieldsValue({name: device.name, asset: device.asset.name})
        }
    }, [device])

    return <Modal width={420} visible={visible} title={"设备配置"} okText={"更新"} onOk={onSave} cancelText={"取消"}
                  onCancel={onCancel} confirmLoading={isLoading}>
        <Form form={form} labelCol={{span: 8}}>
            {
                renderFormItem()
            }
            <Form.Item label={"设备名称"} name="name">
                <Input placeholder={"请输入设备名称"}/>
            </Form.Item>
        </Form>
    </Modal>
}

export default EditBaseInfoModel