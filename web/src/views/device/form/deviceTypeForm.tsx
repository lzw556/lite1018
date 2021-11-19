import {DeviceType} from "../../../types/device_type";
import {Divider, Form} from "antd";
import SensorFormItem from "./item/sensorFormItem";
import {DEFAULT_DEVICE_SETTING_IPN, DEFAULT_WSN_SETTING} from "../../../types/device_setting";
import IpnFormItem from "./item/ipnFormItem";
import WsnFormItem from "./item/wsnFormItem";
import {useEffect} from "react";
import DeviceTypeSelect from "../../../components/deviceTypeSelect";
import {defaultValidateMessages, Rules} from "../../../constants/validator";

const DeviceTypeForm = (props: any) => {
    const {form, type, onChange} = props

    useEffect(() => {
        form.setFieldsValue({
            typeId: type
        })
    }, [type])

    const renderFormItem = () => {

        switch (type) {
            case DeviceType.Gateway:
                return <div>
                    <IpnFormItem ipn={DEFAULT_DEVICE_SETTING_IPN}/>
                    <Divider orientation={"left"} plain>网络配置</Divider>
                    <WsnFormItem wsn={DEFAULT_WSN_SETTING}/>
                </div>
            case DeviceType.Router:
                break
            case DeviceType.BoltLoosening:
            case DeviceType.BoltElongation:
            case DeviceType.NormalTemperatureCorrosion:
            case DeviceType.HighTemperatureCorrosion:
            case DeviceType.VibrationTemperature3Axis:
            case DeviceType.AngleDip:
            case DeviceType.PressureTemperature:
                return <SensorFormItem deviceType={type}/>
            default:
                return null
        }
    }

    return <Form form={form} labelCol={{span: 8}} validateMessages={defaultValidateMessages}>
        <Form.Item label={"设备类型"} name="typeId" rules={[Rules.required]}>
            <DeviceTypeSelect sensor={false} placeholder={"请选择设备类型"} onChange={(value:DeviceType) => {
                onChange(value)
            }}/>
        </Form.Item>
        {
            renderFormItem()
        }
    </Form>
}

export default DeviceTypeForm