import {Form, message, Modal} from "antd";
import {FC, useState} from "react";
import WsnFormItem from "../form/item/wsnFormItem";
import {Device} from "../../../types/device";
import {DEFAULT_WSN_SETTING} from "../../../types/device_setting";
import {UpdateNetworkSettingRequest} from "../../../apis/network";

export interface EditWsnSettingProps {
    visible: boolean
    device?: Device
    onCancel?: () => void
    onSuccess: () => void
}

const EditWsnSettingModal: FC<EditWsnSettingProps> = ({visible, device, onCancel, onSuccess}) => {

    const [form] = Form.useForm()
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const onSave = () => {
        form.validateFields().then(values => {
            if (device) {
                setIsLoading(true)
                UpdateNetworkSettingRequest(device.id, values).then(res => {
                    setIsLoading(false)
                    if (res.code === 200) {
                        message.success("更新成功").then()
                        onSuccess()
                    } else {
                        message.error("更新失败").then()
                    }
                })
            }
        })
    }

    const renderWsnFormItem = () => {
        if (device && device.wsn) {
            const wsn = Object.assign({}, DEFAULT_WSN_SETTING, device.wsn)
            form.setFieldsValue({
                communication_period: wsn.communication_period,
                communication_time_offset: wsn.communication_time_offset
            })
            return <WsnFormItem wsn={wsn}/>
        }
    }

    return <Modal width={420} visible={visible} title={"网络配置"} okText={"更新"} onOk={onSave} cancelText={"取消"}
                  onCancel={onCancel} confirmLoading={isLoading}>
        <Form form={form} labelCol={{span: 8}}>
            {
                renderWsnFormItem()
            }
        </Form>
    </Modal>
}

export default EditWsnSettingModal