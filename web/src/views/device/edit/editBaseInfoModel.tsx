import {Form, Input, message, Modal} from "antd";
import AssetSelect from "../../asset/select/assetSelect";
import {useEffect, useState} from "react";
import {DeviceType} from "../../../types/device_type";
import {UpdateDeviceRequest} from "../../../apis/device";

const EditBaseInfoModel = (props: any) => {
    const {visible, device, onCancel, onSuccess} = props
    const [form] = Form.useForm()
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const onSave = () => {
        form.validateFields().then(values => {
            setIsLoading(true)
            UpdateDeviceRequest(device.id, values.name).then(res => {
                setIsLoading(false)
                if (res.code === 200) {
                    message.success("更新成功").then()
                    onSuccess()
                }else {
                    message.error(`更新失败,${res.msg}`).then()
                }
            })
        })
    }

    const renderFormItem = () => {
        if (device) {
            switch (device.typeId) {
                case DeviceType.Gateway:
                    return <Form.Item label={"所属资产"} name={"asset"}>
                        <AssetSelect value={device.asset.name}/>
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
        if (device) {
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