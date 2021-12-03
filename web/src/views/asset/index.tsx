import {FC, useCallback, useState} from "react";
import {Button, Popconfirm, Space} from "antd";
import {Content} from "antd/lib/layout/layout";
import TableLayout, {TableProps} from "../layout/TableLayout";
import {GetAssetRequest, PagingAssetsRequest, RemoveAssetRequest} from "../../apis/asset";
import AddModal from "./addModal";
import {InitializeAssetState} from "../../types/asset";
import EditModal from "./editModal";
import {DeleteOutlined, EditOutlined, PlusOutlined} from "@ant-design/icons";
import ShadowCard from "../../components/shadowCard";
import MyBreadcrumb from "../../components/myBreadcrumb";
import HasPermission from "../../permission";
import {Permission} from "../../permission/permission";


const AssetPage: FC = () => {
    const [addAssetVisible, setAddAssetVisible] = useState<boolean>(false)
    const [editAssetVisible, setEditAssetVisible] = useState<boolean>(false)
    const [asset, setAsset] = useState(InitializeAssetState)
    const [table, setTable] = useState<TableProps>({
        refreshKey: 0,
        data: {},
        isLoading: false,
        pagination: true
    })

    const onChange = useCallback((current: number, size: number) => {
        onLoading(true)
        PagingAssetsRequest(current, size).then(data => {
            onLoading(false)
            setTable(old => Object.assign({}, old, {data: data}))
        }).catch((_) => {
            onLoading(false)
        })
    }, [])

    const onAddAssetSuccess = () => {
        onRefresh()
        setAddAssetVisible(false)
    }

    const onEditAssetSuccess = () => {
        onRefresh()
        setEditAssetVisible(false)
    }

    const onRefresh = () => {
        setTable(old => Object.assign({}, old, {refreshKey: old.refreshKey + 1}))
    }

    const onLoading = (isLoading: boolean) => {
        setTable(old => Object.assign({}, old, {isLoading: isLoading}))
    }

    const onDelete = async (id: number) => {
        RemoveAssetRequest(id).then(_ => onRefresh())
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
                isLoading={table.isLoading}
                refreshKey={table.refreshKey}
                onChange={onChange}
                pagination={true}
                data={table.data}/>
        </ShadowCard>
        <AddModal visible={addAssetVisible} onCancel={() => setAddAssetVisible(false)}
                  onSuccess={onAddAssetSuccess}/>
        <EditModal visible={editAssetVisible} asset={asset} onCancel={() => setEditAssetVisible(false)}
                   onSuccess={onEditAssetSuccess}/>
    </Content>
}

export default AssetPage