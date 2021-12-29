import {Select, SelectProps} from "antd";
import {FC, useEffect, useState} from "react";
import {GetDevicesByFilterRequest} from "../apis/device";
import {Device} from "../types/device";

export interface DeviceSelectProps extends SelectProps<any> {
    filter: "notInNetwork" | "sensors" | "gateway" | "router" | "all"
    asset: number
}

const {Option} = Select;

const DeviceSelect:FC<DeviceSelectProps> = (props) => {
    const {asset, filter} = props
    const [devices, setDevices] = useState<Device[]>([])

    useEffect(() => {
        GetDevicesByFilterRequest(asset, filter).then(setDevices)
    }, [asset, filter])

    return <Select {...props}>
        {
            devices.map(device => <Option key={device.id} value={device.id}>{device.name}</Option>)
        }
    </Select>
}

export default DeviceSelect