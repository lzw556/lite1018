import {Select, SelectProps} from "antd";
import {FC, useEffect, useState} from "react";
import {Asset} from "../types/asset";
import {PagingAssetsRequest} from "../apis/asset";
import {CaretDownOutlined} from "@ant-design/icons";

const {Option} = Select

export interface AssetSelectProps extends SelectProps<any> {
}

const AssetSelect:FC<AssetSelectProps> = (props: AssetSelectProps) => {
    const [assets, setAssets] = useState<Asset[]>([])
    const {children} = props

    useEffect(() => {
        PagingAssetsRequest(1, 100).then(res => {
            if (res.code === 200) {
                setAssets(res.data.result)
            }
        })
    }, [])

    return <Select {...props} suffixIcon={<CaretDownOutlined />}>
        {
            children
        }
        {
            assets.map(item => <Option key={item.id}
                                       value={item.id}>{item.name}</Option>)
        }
    </Select>
}

export default AssetSelect