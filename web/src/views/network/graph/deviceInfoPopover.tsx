import {FC} from "react";
import {Device} from "../../../types/device";
import {Form, Tag} from "antd";
import "../../../string-extension"
import {ColorHealth, ColorWarn} from "../../../constants/color";
import "./graph.css"
import moment from "moment/moment";

export interface DeviceInfoPopoverProps {
    device: Device
}

const DeviceInfoPopover:FC<DeviceInfoPopoverProps> = ({device}) => {
    return <Form size={"small"}>
        <Form.Item label={"MAC地址"} className={"ts-form-item"}>
            {
                device.macAddress.toUpperCase().macSeparator()
            }
        </Form.Item>
        <Form.Item label={"信号强度"} className={"ts-form-item"}>
            {
                device.state ? `${device.state.signalLevel} dB` : `0 dB`
            }
        </Form.Item>
        <Form.Item label={"电池电压"} className={"ts-form-item"}>
            {
                device.state ? `${device.state.batteryVoltage} mV` : `0 mV`
            }
        </Form.Item>
        <Form.Item label={"状态"} className={"ts-form-item"}>
            <Tag color={device.state && device.state.isOnline ? ColorHealth : ColorWarn}>
                {device.state && device.state.isOnline ? "在线" : "离线"}
            </Tag>
        </Form.Item>
        <Form.Item label={"最近连接时间"} className={"ts-form-item"}>
            {
                moment(device.state.connectAt).local().format("YYYY-MM-DD HH:mm:ss")
            }
        </Form.Item>
    </Form>
}

export default DeviceInfoPopover