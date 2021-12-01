import {message, Select, Space} from "antd";
import Label from "../../../components/label";
import {useEffect, useState} from "react";
import {PagingAssetsRequest} from "../../../apis/asset";
import {Asset} from "../../../types/asset";
import AssetStatistic from "./assetStatistic";
import {useHistory, useLocation} from "react-router-dom";
import {GetParamValue} from "../../../utils/path";
import {Content} from "antd/es/layout/layout";
import MyBreadcrumb from "../../../components/myBreadcrumb";

const {Option} = Select;

const AssetOverview = () => {
    const location = useLocation()
    const history = useHistory()
    const [assets, setAssets] = useState<Asset[]>()
    const [asset, setAsset] = useState<Asset>()

    useEffect(() => {
        PagingAssetsRequest(1, 100).then(data => {
                setAssets(data.result)
                selectAsset(data.result)
        })
    }, [])

    const selectAsset = (values: Asset[]) => {
        const id = GetParamValue(location.search, "id")
        let index = 0
        if (id && Number(id)) {
            index = values.findIndex(item => item.id === Number(id))
        }
        if (index === -1) {
            message.error("资产不存在").then()
            history.push("/dashboard")
        }else {
            setAsset(values[index])
        }
    }

    return <Content>
        <MyBreadcrumb>
            <Space style={{backgroundColor: "white"}}>
                <Label name={"资产"}>
                    <Select style={{width: "150px", textAlign: "center"}}  bordered={false} value={asset?.id} onChange={(value: number) => {
                        setAsset(assets?.find(asset => asset.id === value))
                    }}>
                        {
                            assets?.map(asset => <Option key={asset.id} value={asset.id}>{asset.name}</Option>)
                        }
                    </Select>
                </Label>
            </Space>
        </MyBreadcrumb>
        {
            asset && <AssetStatistic value={asset}/>
        }
    </Content>
}

export default AssetOverview