import {Form, Modal, ModalProps} from "antd";
import {Device} from "../../../types/device";
import {UpdateDeviceSettingRequest} from "../../../apis/device";
import {DeviceType} from "../../../types/device_type";
import {DEFAULT_DEVICE_SETTING_IPN} from "../../../types/device_setting";
import SensorFormItem from "../form/item/sensorFormItem";
import IpnFormItem from "../form/item/ipnFormItem";
import {useState} from "react";
import {defaultValidateMessages} from "../../../constants/validator";

export interface EditSettingProps extends ModalProps {
    device?: Device
    visible: boolean
    onSuccess: () => void
}

const EditSettingModal = (props: EditSettingProps) => {
    const {device, visible, onCancel, onSuccess} = props
    const [form] = Form.useForm()
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const renderSettingFormItems = () => {
        if (device) {
            switch (device.typeId) {
                case DeviceType.Gateway:
                    const ipn = Object.assign({}, DEFAULT_DEVICE_SETTING_IPN, device.ipn)
                    form.setFieldsValue({ip_mode: ipn.ip_mode, ntp_is_enabled: ipn.ntp_is_enabled})
                    return <IpnFormItem ipn={ipn}/>
                case DeviceType.Router:
                    break
                default:
                    form.setFieldsValue(device.sensors)
                    return <SensorFormItem deviceType={device.typeId} device={device}/>
            }
        }
        return <div/>
    }

    const onSave = () => {
        form.validateFields().then(values => {
            Object.keys(values).forEach(key => {
                if (Number(values[key])) {
                    values[key] = Number(values[key])
                }
            })
            if (device) {
                setIsLoading(true)
                UpdateDeviceSettingRequest(device.id, values).then(_ => {
                    setIsLoading(false)
                    onSuccess()
                })
            }
        })
    }

    return <Modal width={480} visible={visible} title={"设备配置"} okText={"更新"} onOk={onSave} cancelText={"取消"}
                  onCancel={onCancel} confirmLoading={isLoading}>
        <Form form={form} labelCol={{span: 8}} validateMessages={defaultValidateMessages}>
            {
                renderSettingFormItems()
            }
        </Form>
    </Modal>
}

export default EditSettingModal