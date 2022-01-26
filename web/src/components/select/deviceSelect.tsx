import {Select, SelectProps} from "antd";
import {FC, useEffect, useState} from "react";
import {Device} from "../../types/device";
import {GetDevicesRequest} from "../../apis/device";

export interface DeviceSelectProps extends SelectProps<any> {
    filters?: any;
}

const {Option} = Select;

const DeviceSelect: FC<DeviceSelectProps> = (props) => {
    const {filters} = props
    const [devices, setDevices] = useState<Device[]>([])

    useEffect(() => {
        GetDevicesRequest(filters).then(setDevices)
    }, [filters])

    return <Select {...props}>
        {
            devices.map(device => <Option key={device.id} value={device.id}>{device.name}</Option>)
        }
    </Select>
}

export default DeviceSelect