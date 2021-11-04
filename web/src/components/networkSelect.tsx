import {FC, useEffect, useState} from "react";
import {Select, SelectProps} from "antd";
import {Network} from "../types/network";
import {GetNetworksRequest} from "../apis/network";
import {CaretDownOutlined} from "@ant-design/icons";

export interface NetworkSelectProps extends SelectProps<any> {
    asset: number
    onDefaultSelect: (id: number) => void
}

const {Option} = Select

const NetworkSelect: FC<NetworkSelectProps> = (props) => {
    const [networks, setNetworks] = useState<Network[]>([])
    const {asset, onDefaultSelect} = props

    useEffect(() => {
        GetNetworksRequest(asset).then(res => {
            if (res.code === 200) {
                setNetworks(res.data)
                onDefaultSelect(res.data[0]?.id)
            }
        })
    }, [asset])

    return <Select {...props} suffixIcon={<CaretDownOutlined/>}>
        {
            networks.map(item => (<Option key={item.id} value={item.id}>{item.name}</Option>))
        }
    </Select>
}

export default NetworkSelect