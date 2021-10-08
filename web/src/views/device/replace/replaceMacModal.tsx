import {Form, Input, message, Modal} from "antd";
import {Device} from "../../../types/device";
import {FC} from "react";
import {ReplaceDeviceMacRequest} from "../../../apis/device";

export interface ReplaceMacProps {
    visible: boolean
    device?: Device
    onCancel?: () => void
    onSuccess: () => void
}

const ReplaceMacModal: FC<ReplaceMacProps> = ({visible, device, onCancel, onSuccess}) => {
    const [form] = Form.useForm()

    const onSave = () => {
        form.validateFields().then(values => {
            if (device) {
                ReplaceDeviceMacRequest(device.id, values.mac).then(res => {
                    if (res.code === 200) {
                        message.success("替换成功").then()
                        onSuccess()
                    } else {
                        message.error(`替换失败,${res.msg}`).then()
                    }
                })
            }
        })
    }

    return <Modal width={420} visible={visible} title={"设备替换"} okText={"确定"} onOk={onSave} cancelText={"取消"}
                  onCancel={onCancel}>
        <Form form={form} labelCol={{span: 8}}>
            <Form.Item label={"MAC地址"} name="mac" initialValue={device ? device.macAddress : null}
                       rules={[{required: true, message: "请输入设备MAC地址"}]}>
                <Input placeholder={"请输入设备MAC地址"}/>
            </Form.Item>
        </Form>
    </Modal>
}

export default ReplaceMacModal