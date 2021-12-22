import {FC, useCallback, useEffect, useState} from "react";
import {Button, Popconfirm, Space} from "antd";
import {Content} from "antd/lib/layout/layout";
import TableLayout from "../layout/TableLayout";
import {GetAssetRequest, PagingAssetsRequest, RemoveAssetRequest} from "../../apis/asset";
import AddModal from "./addModal";
import {InitializeAssetState} from "../../types/asset";
import {DeleteOutlined, EditOutlined, PlusOutlined} from "@ant-design/icons";
import ShadowCard from "../../components/shadowCard";
import MyBreadcrumb from "../../components/myBreadcrumb";
import HasPermission from "../../permission";
import {Permission} from "../../permission/permission";
import {PageResult} from "../../types/page";


const AssetPage: FC = () => {
    const [addAssetVisible, setAddAssetVisible] = useState<boolean>(false)
    const [editAssetVisible, setEditAssetVisible] = useState<boolean>(false)
    const [asset, setAsset] = useState(InitializeAssetState)
    const [dataSource, setDataSource] = useState<PageResult<any>>()

    const fetchAssets = useCallback((current: number, size: number) => {
        PagingAssetsRequest(current, size).then(setDataSource)
    }, [])

    useEffect(() => {
        fetchAssets(1, 10)
    }, [fetchAssets])

    const onRefresh = () => {
        if (dataSource) {
            fetchAssets(dataSource.page, dataSource.size)
        }
    }

    const onAddAssetSuccess = () => {
        setAddAssetVisible(false)
        onRefresh()
    }

    const onEditAssetSuccess = () => {
        setEditAssetVisible(false)
    }

    const onDelete = async (id: number) => {
        RemoveAssetRequest(id).then()
    }

    const onEdit = async (id: number) => {
        GetAssetRequest(id).then(data => {
            setAsset(data)
            setEditAssetVisible(true)
        })
    }

    const columns = [
        {
            title: '名称',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '操作',
            key: 'action',
            render: (text: any, record: any) => {
                return <Space>
                    <HasPermission value={Permission.AssetEdit}>
                        <Button type="text" size="small" icon={<EditOutlined/>}
                                onClick={() => onEdit(record.id)}/>
                    </HasPermission>
                    <HasPermission value={Permission.AssetDelete}>
                        <Popconfirm placement="left" title="确认要删除该资产吗?" onConfirm={() => onDelete(record.id)}
                                    okText="删除" cancelText="取消">
                            <Button type="text" size="small" icon={<DeleteOutlined/>} danger/>
                        </Popconfirm>
                    </HasPermission>
                </Space>
            }
        }
    ]

    return <Content>
        <MyBreadcrumb>
            <Button type="primary" onClick={() => {
                setAddAssetVisible(true)
            }}>
                添加资产 <PlusOutlined/>
            </Button>
        </MyBreadcrumb>
        <ShadowCard>
            <TableLayout
                emptyText={"资产列表为空"}
                permissions={[Permission.AssetDelete, Permission.AssetEdit]}
                columns={columns}
                dataSource={dataSource}
                onPageChange={fetchAssets}/>
        </ShadowCard>
        <AddModal visible={addAssetVisible} onCancel={() => setAddAssetVisible(false)}
                  onSuccess={onAddAssetSuccess}/>
        {/*<EditModal visible={editAssetVisible} asset={asset} onCancel={() => setEditAssetVisible(false)}*/}
        {/*           onSuccess={onEditAssetSuccess}/>*/}
    </Content>
}

export default AssetPage