import {Form, Modal, ModalProps} from "antd";
import {Device} from "../../../types/device";
import {GetDeviceSettingRequest, UpdateDeviceSettingRequest} from "../../../apis/device";
import {useEffect, useState} from "react";
import {defaultValidateMessages} from "../../../constants/validator";
import { DeviceSettingContent } from "../DeviceSettingContent";

export interface EditSettingProps extends ModalProps {
    device: Device
    visible: boolean
    onSuccess: () => void
}

const EditSettingModal = (props: EditSettingProps) => {
    const {device, visible, onCancel, onSuccess} = props
    const [form] = Form.useForm()
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [settings, setSettings] = useState<any[]>([])

    useEffect(() => {
        if (visible) {
            GetDeviceSettingRequest(device.id).then(setSettings)
        }
    }, [visible])

    const onSave = () => {
        form.validateFields().then(values => {
            setIsLoading(true)
            UpdateDeviceSettingRequest(device.id, values).then(_ => {
                setIsLoading(false)
                onSuccess()
            })
        })
    }

    return <Modal width={480} visible={visible} title={"设备配置"} okText={"更新"} onOk={onSave} cancelText={"取消"}
                  onCancel={onCancel} confirmLoading={isLoading}>
        <Form form={form} labelCol={{span: 8}} validateMessages={defaultValidateMessages}>
            <DeviceSettingContent deviceType={device.typeId} settings={settings}/>
        </Form>
    </Modal>
}

export default EditSettingModal