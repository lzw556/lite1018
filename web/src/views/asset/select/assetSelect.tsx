import {Select, SelectProps} from "antd";
import {FC, useState} from "react";
import {Asset} from "../../../types/asset";
import {PagingAssetsRequest} from "../../../apis/asset";

const {Option} = Select

export interface AssetSelectProps extends SelectProps<any> {
    defaultOption?: any
}

const AssetSelect:FC<AssetSelectProps> = (props: AssetSelectProps) => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [assets, setAssets] = useState<Asset[]>([])
    const {defaultOption} = props

    const onLoadingAsset = (open: any) => {
        if (open) {
            setIsLoading(true)
            PagingAssetsRequest(1, 100).then(res => {
                if (res.code === 200) {
                    setIsLoading(false)
                    setAssets(res.data.result)
                }
            })
        }
    }

    return <Select {...props} onDropdownVisibleChange={onLoadingAsset}  loading={isLoading} >
        {
            defaultOption && (<Option key={defaultOption.value} value={defaultOption.value}>{defaultOption.text}</Option>)
        }
        {
            assets.map(item => <Option key={item.id}
                                       value={item.id}>{item.name}</Option>)
        }
    </Select>
}

export default AssetSelect