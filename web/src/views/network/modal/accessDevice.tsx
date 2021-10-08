import {Form, message, Modal, Select} from "antd";
import {FC, useState} from "react";
import {Device} from "../../../types/device";
import {PagingDevicesRequest} from "../../../apis/device";
import {AccessDevicesRequest} from "../../../apis/network";

export interface AccessDeviceModalProps {
    visible: boolean
    assetId: number
    networkId: number
    parent?: Device
    onCancel?: () => void
    onSuccess: (id: number) => void
}

const {Option} = Select

const AccessDeviceModal: FC<AccessDeviceModalProps> = ({visible, parent, assetId, networkId, onCancel, onSuccess}) => {
    const [parents, setParents] = useState<Device[]>([])
    const [devices, setDevices] = useState<Device[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [form] = Form.useForm()

    const onLoadParents = (open: any) => {
        if (open) {
            PagingDevicesRequest(assetId, 1, 100, {target: "network_id", text: networkId}).then(res => {
                if (res.code === 200) {
                    setParents(res.data.result)
                }
            })
        }
    }

    const onLoadDevices = (open: any) => {
        if (open) {
            PagingDevicesRequest(assetId, 1, 100, {target: "network_id", text: 0}).then(res => {
                if (res.code === 200) {
                    setDevices(res.data.result)
                }
            })
        }
    }

    const onSave = () => {
        form.validateFields().then(values => {
            setIsLoading(true)
            AccessDevicesRequest(networkId, values.parent, values.devices).then(res => {
                setIsLoading(false)
                if (res.code === 200) {
                    message.success("设备接入成功").then()
                    onSuccess(networkId)
                } else {
                    message.error("设备接入失败").then()
                }
            })
        }).catch(e => setIsLoading(false))
    }

    return <Modal
        width={380}
        title={"设备接入"}
        okText={"确定"}
        onOk={onSave}
        cancelText={"取消"}
        visible={visible}
        onCancel={onCancel}
        confirmLoading={isLoading}
    >
        <Form form={form} labelCol={{span: 6}}>
            <Form.Item label={"父设备"} name={"parent"} rules={[{required: true, message: "请选择父设备"}]}>
                <Select placeholder={"请选择父设备"} onDropdownVisibleChange={onLoadParents}>
                    {
                        parents.map(item => <Option key={item.id} value={item.id}>{item.name}</Option>)
                    }
                </Select>
            </Form.Item>
            <Form.Item label={"接入设备"} name={"devices"} rules={[{required: true, message: "请选择需要接入的设备"}]}>
                <Select placeholder={"请选择需要接入的设备"} mode={'multiple' as const} maxTagCount={'responsive' as const}
                        onDropdownVisibleChange={onLoadDevices}>
                    {
                        devices.map(item => <Option key={item.id} value={item.id}>{item.name}</Option>)
                    }
                </Select>
            </Form.Item>
        </Form>
    </Modal>
}

export default AccessDeviceModal