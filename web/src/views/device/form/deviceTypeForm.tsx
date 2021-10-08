import {DeviceType} from "../../../types/device_type";
import {Divider, Form, Select} from "antd";
import SensorFormItem from "./item/sensorFormItem";
import {DEFAULT_DEVICE_SETTING_IPN, DEFAULT_WSN_SETTING} from "../../../types/device_setting";
import IpnFormItem from "./item/ipnFormItem";
import WsnFormItem from "./item/wsnFormItem";

const {Option, OptGroup} = Select

const DeviceTypeForm = (props: any) => {
    const {form, type, onChange} = props

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
                return <SensorFormItem deviceType={type}/>
            default:
                return null
        }
    }

    return <Form form={form} labelCol={{span: 8}}>
        <Form.Item label={"设备类型"} name="typeId" initialValue={type} rules={[{required: true, message: "请选择设备类型"}]}>
            <Select placeholder={"请选择设备类型"} onChange={(value: DeviceType) => {
                onChange(value)
            }}>
                <OptGroup label={"网关"} key={"gateway"}>
                    <Option key={1} value={1}>网关</Option>
                </OptGroup>
                <OptGroup label={"路由器"} key={"router"}>
                    <Option key={257} value={257}>路由器</Option>
                </OptGroup>
                <OptGroup label={"传感器"} key={"sensor"}>
                    <Option key={DeviceType.BoltLoosening} value={DeviceType.BoltLoosening}>螺栓松动</Option>
                    <Option key={DeviceType.BoltElongation} value={DeviceType.BoltElongation}>螺栓伸长量</Option>
                    <Option key={DeviceType.NormalTemperatureCorrosion}
                            value={DeviceType.NormalTemperatureCorrosion}>常温腐蚀</Option>
                    <Option key={DeviceType.HighTemperatureCorrosion}
                            value={DeviceType.HighTemperatureCorrosion}>高温腐蚀</Option>
                </OptGroup>
            </Select>
        </Form.Item>
        {
            renderFormItem()
        }
    </Form>
}

export default DeviceTypeForm