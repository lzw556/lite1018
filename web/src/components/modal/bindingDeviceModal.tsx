import {Form, Input, Modal, ModalProps} from "antd";
import {FC, useEffect, useState} from "react";
import {CheckMacBindingRequest} from "../../apis/measurement";
import FlangeShape from "../shape/flangeShape";

export interface BindingDeviceModalProps extends ModalProps {
    quantity: number;
    defaultValues?: {index: number, value: string}[];
    settings?: any;
    onSuccess: (bindings: any) => void
}

const BindingDeviceModal: FC<BindingDeviceModalProps> = (props) => {
    const {visible, quantity, defaultValues, settings, onSuccess} = props;
    const [form] = Form.useForm();
    const [devices, setDevices] = useState<any>(defaultValues)

    useEffect(() => {
        if (visible) {
            if (quantity > 1) {
                setDevices(defaultValues)
            }else {
                form.setFieldsValue({
                    mac: devices
                })
            }
        }
    }, [visible])

    const onAdd = () => {
        if (quantity > 1) {
            onSuccess(devices)
        }else {
            form.validateFields(["mac"]).then(values => {
                onSuccess([{index: 0, value: values.mac}])
            })
        }
    }

    const onBind = (value: string, index: number) => {
        setDevices([...devices, {index, value}])
    }

    const onCheckMadBinding = (rule: any, value: any) => {
        return new Promise((resolve, reject) => {
            if (!value) {
                reject("请输入MAC地址")
            }
            if (value.length !== 12) {
                reject("请输入正确的MAC地址")
                return
            }
            CheckMacBindingRequest(value).then(
                resolve
            ).catch(e => {
                reject(e)
            })
        })
    }

    const render = () => {
        if (quantity > 1) {
            return <FlangeShape quantity={quantity}
                                defaultValues={devices}
                                offset={settings ? parseFloat(settings.offset_of_angel) : 0}
                                size={360} onOk={onBind}/>
        }
        return <Form form={form} labelCol={{span: 6}}>
            <Form.Item label={"MAC地址"} name={"mac"} required rules={[{validator: onCheckMadBinding}]}>
                <Input placeholder={"请输入设备MAC地址"}/>
            </Form.Item>
        </Form>
    }

    return <Modal {...props} width={420} title={"设备绑定"} cancelText={"取消"} okText={"绑定"}
                  onOk={onAdd}>
        {
            render()
        }
    </Modal>
}

export default BindingDeviceModal;