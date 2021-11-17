import {FC, useCallback, useState} from "react";
import {Button, message, Popconfirm, Space} from "antd";
import {Content} from "antd/lib/layout/layout";
import TableLayout, {TableProps} from "../layout/TableLayout";
import {GetAssetRequest, PagingAssetsRequest, RemoveAssetRequest} from "../../apis/asset";
import AddModal from "./addModal";
import {InitializeAssetState} from "../../types/asset";
import EditModal from "./editModal";
import {DeleteOutlined, EditOutlined, FolderAddOutlined} from "@ant-design/icons";
import ShadowCard from "../../components/shadowCard";
import MyBreadcrumb from "../../components/myBreadcrumb";


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
        PagingAssetsRequest(current, size).then(res => {
            onLoading(false)
            if (res.code === 200) {
                setTable(old => Object.assign({}, old, {data: res.data}))
            }
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
        const res = await RemoveAssetRequest(id)
        if (res.code === 200) {
            onRefresh()
            message.success("删除成功").then()
        } else {
            message.error(res.msg).then()
        }
    }

    const onEdit = async (id: number) => {
        const res = await GetAssetRequest(id)
        if (res.code === 200) {
            setAsset(res.data)
            setEditAssetVisible(true)
        } else {
            message.error(res.msg).then()
        }
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
            render: (text: any, record: any) => (
                <Space>
                    <Button type="text" size="small" icon={<EditOutlined/>}
                            onClick={() => onEdit(record.id)}/>
                    <Popconfirm placement="left" title="确认要删除该用户吗?" onConfirm={() => onDelete(record.id)}
                                okText="删除" cancelText="取消">
                        <Button type="text" size="small" icon={<DeleteOutlined/>} danger/>
                    </Popconfirm>
                </Space>
            ),
        }
    ]

    return <Content>
        <MyBreadcrumb items={["资产管理", "资产列表"]}>
            <Button type="primary" onClick={() => {
                setAddAssetVisible(true)
            }}>
                添加资产 <FolderAddOutlined/>
            </Button>
        </MyBreadcrumb>
        <ShadowCard>
            <TableLayout
                emptyText={"资产列表为空"}
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