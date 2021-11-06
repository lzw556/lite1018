import {DeviceType, DeviceTypeString, GetSensors} from "../types/device_type";
import {Select, SelectProps} from "antd";
import {FC} from "react";
import {CaretDownOutlined} from "@ant-design/icons";

const {Option, OptGroup} = Select

export interface DeviceTypeSelectProps extends SelectProps<any> {
    sensor: boolean
}

const DeviceTypeSelect: FC<DeviceTypeSelectProps> = (props) => {
    const {sensor, children} = props

    const renderSensors = () => {
        return GetSensors().map(item => (<Option key={item} value={item}>{DeviceTypeString(item)}</Option>))
    }

    const render = () => {
        if (sensor) {
            return <Select {...props} suffixIcon={<CaretDownOutlined />}>
                {children}
                {
                    renderSensors()
                }
            </Select>
        } else {
            return <Select {...props}>
                <OptGroup label={"网关"} key={"gateway"}>
                    <Option key={1} value={1}>{DeviceTypeString(DeviceType.Gateway)}</Option>
                </OptGroup>
                <OptGroup label={"中继器"} key={"router"}>
                    <Option key={257} value={257}>{DeviceTypeString(DeviceType.Router)}</Option>
                </OptGroup>
                <OptGroup label={"传感器"} key={"sensor"}>
                    {
                        renderSensors()
                    }
                </OptGroup>
            </Select>
        }
    }
    return render()
}

export default DeviceTypeSelect