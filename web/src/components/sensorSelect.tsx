import {Select, SelectProps} from "antd";
import {FC, useState} from "react";
import {CaretDownOutlined} from "@ant-design/icons";
import {Device} from "../types/device";
import {PagingDevicesRequest} from "../apis/device";

export interface SensorSelectProps extends SelectProps<any> {
    assetId: number
    onChange?: (value: any) => void
}

const {Option} = Select

const SensorSelect: FC<SensorSelectProps> = (props) => {
    const {onChange, assetId} = props
    const [devices, setDevices] = useState<Device[]>()

    const onLoadDevices = (open: any) => {
        if (open) {
            PagingDevicesRequest(assetId, 1, 100, {}).then(data => {
                setDevices(data.result.filter(item => item.category === 3))
            })
        }
    }

    return <Select {...props} suffixIcon={<CaretDownOutlined/>}
                   onDropdownVisibleChange={onLoadDevices}
                   onChange={onChange}>
        <Option value={0} key={0}>所有设备</Option>
        {
            devices?.map(item => (
                <Option key={item.id} value={item.id}>{item.name}</Option>))
        }
    </Select>
}

export default SensorSelect