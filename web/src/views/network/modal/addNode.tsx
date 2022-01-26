import {FC, useEffect, useState} from "react";
import Modal from "antd/es/modal/Modal";
import {Form, Input} from "antd";
import DeviceTypeSelect from "../../../components/select/deviceTypeSelect";
import {DeviceType} from "../../../types/device_type";
import IpnFormItem, {IPNSettingKeys} from "../../device/form/item/ipnFormItem";
import {DEFAULT_DEVICE_SETTING_IPN} from "../../../types/device_setting";
import SensorFormItem, {SensorSettingKeys} from "../../device/form/item/sensorFormItem";
import {PretighteningSettings} from "../../device/form/item/pretighteningFormItem";
import {SpeedObjectSettings} from "../../device/form/item/speedObjectFormItem";
import {LengthRodSettings} from "../../device/form/item/lengthRodFormItem";

export interface AddNodeModalProps {
    visible: boolean
    onCancel?: () => void
    onSuccess: (node: any) => void
}

const AddNodeModal: FC<AddNodeModalProps> = ({visible, onCancel, onSuccess}) => {
    const [form] = Form.useForm()
    const [deviceType, setDeviceType] = useState<DeviceType>()

    useEffect(() => {
        if (visible) {
            form.resetFields()
            setDeviceType(undefined)
        }
    }, [visible])

    const onSave = () => {
        form.validateFields().then(values => {
            onSuccess({
                id: values.address,
                text: values.name,
                data: {
                    name: values.name,
                    address: values.address,
                    type: values.type,
                    settings: JSON.stringify(buildDeviceSettings(values))
                }
            })
        })
    }

    const buildDeviceSettings = (values:any) => {
        let settings = {
            ipn: {},
            sensors: {},
        }
        switch (deviceType) {
            case DeviceType.Gateway:
                Object.keys(values)
                    .filter(key => IPNSettingKeys.includes(key))
                    .forEach(key => {
                        Object.assign(settings.ipn,{[key]: values[key]})
                    })
                break
            case DeviceType.Router:
                return {}
            default:
                let settingKeys: string[] = SensorSettingKeys
                if (deviceType === DeviceType.BoltElongation) {
                    settingKeys = settingKeys.concat(SpeedObjectSettings, PretighteningSettings)
                }else if (deviceType === DeviceType.NormalTemperatureCorrosion) {
                    settingKeys = settingKeys.concat(SpeedObjectSettings)
                }else if (deviceType === DeviceType.HighTemperatureCorrosion) {
                    settingKeys = settingKeys.concat(SpeedObjectSettings, LengthRodSettings)
                }
                Object.keys(values)
                    .filter(key => settingKeys.includes(key))
                    .forEach(key => {
                        Object.assign(settings.sensors,{[key]: values[key]})
                    })
                break
        }
        return settings
    }

    const renderFormItem = () => {
        switch (deviceType) {
            case DeviceType.Gateway:
                return <IpnFormItem ipn={DEFAULT_DEVICE_SETTING_IPN}/>
            case DeviceType.Router:
                break
            case DeviceType.BoltLoosening:
            case DeviceType.BoltElongation:
            case DeviceType.NormalTemperatureCorrosion:
            case DeviceType.HighTemperatureCorrosion:
                return <SensorFormItem deviceType={deviceType}/>
            default:
                return null
        }
    }

    return <Modal width={420}
                  title={"添加设备"}
                  okText={"确定"}
                  onOk={onSave}
                  cancelText={"取消"}
                  visible={visible}
                  onCancel={onCancel}>
        <Form form={form} labelCol={{span: 8}}>
            <Form.Item label={"设备名称"} name={"name"} rules={[{required:true, message:"请输入设备名称"}]}>
                <Input placeholder={"请输入设备名称"}/>
            </Form.Item>
            <Form.Item label={"MAC地址"} name={"address"} rules={[{required:true, message: "请输入设备MAC地址"}]}>
                <Input placeholder={"请输入设备MAC地址"}/>
            </Form.Item>
            <Form.Item label={"设备类型"} name={"type"} rules={[{required:true, message: "请选择设备类型"}]}>
                <DeviceTypeSelect placeholder={"请选择设备类型"} onChange={value => {
                    setDeviceType(value)
                }}/>
            </Form.Item>
            {
                renderFormItem()
            }
        </Form>
    </Modal>
}

export default AddNodeModal