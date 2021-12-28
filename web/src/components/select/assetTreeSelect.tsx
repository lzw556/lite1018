import {TreeSelect, TreeSelectProps} from "antd";
import {FC, useEffect, useState} from "react";
import {Asset} from "../../types/asset";
import {GetAssetsRequest} from "../../apis/asset";
import {CaretDownOutlined} from "@ant-design/icons";

export interface AssetTreeSelectProps extends TreeSelectProps<any> {
    onChange?: (value: number) => void;
}

const {TreeNode} = TreeSelect;

const AssetTreeSelect: FC<AssetTreeSelectProps> = (props) => {
    const {onChange, defaultActiveFirstOption} = props;
    const [dataSource, setDataSource] = useState<Asset[]>()

    useEffect(() => {
        GetAssetsRequest().then(data => {
            if (data.length && defaultActiveFirstOption) {
                onChange && onChange(data[0].id);
            }
            setDataSource(data)
        })
    }, [])

    const convertAssetTreeNode: any = (parentId: number) => {
        return dataSource?.filter(item => item.parentId == parentId).map(item => {
            return <TreeNode key={item.id} value={item.id} title={item.name}>
                {
                    convertAssetTreeNode(item.id)
                }
            </TreeNode>
        })
    }

    return <TreeSelect {...props} treeDefaultExpandAll={true} suffixIcon={<CaretDownOutlined/>} onChange={onChange}>
        {
            convertAssetTreeNode(0)
        }
    </TreeSelect>
}

export default AssetTreeSelect;