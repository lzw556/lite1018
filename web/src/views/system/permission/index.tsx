import MyBreadcrumb from "../../../components/myBreadcrumb";
import {Content} from "antd/es/layout/layout";
import {PlusOutlined} from "@ant-design/icons";
import {Button} from "antd";
import {useCallback, useState} from "react";
import ShadowCard from "../../../components/shadowCard";
import TableLayout, {TableProps} from "../../layout/TableLayout";
import {PagingPermissionsRequest} from "../../../apis/permission";
import AddPermissionModal from "./modal/add";

const PermissionPage = () => {
    const [addVisible, setAddVisible] = useState(false);
    const [table, setTable] = useState<TableProps>({
        refreshKey: 0,
        data: {},
        isLoading: false,
        pagination: true
    })

    const onChange = useCallback((current: number, size: number) => {
        PagingPermissionsRequest(current, size).then(res => {
            if (res.code === 200) {
                setTable({...table, data: res.data})
            }
        })
    }, [])

    const onRefresh = () => {
        setTable({...table, refreshKey: table.refreshKey + 1})
    }

    const columns = [
        {
            title: '路径',
            dataIndex: 'path',
            key: 'path',
        },
        {
            title: '描述',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: '请求',
            dataIndex: 'method',
            key: 'method',
        }
    ]

    return <Content>
        <MyBreadcrumb items={["系统管理", "权限管理"]}>
            <Button type={"primary"} onClick={() => setAddVisible(true)}>添加权限 <PlusOutlined/></Button>
        </MyBreadcrumb>
        <ShadowCard>
            <TableLayout
                emptyText={"权限列表为空"}
                columns={columns}
                isLoading={table.isLoading}
                refreshKey={table.refreshKey}
                onChange={onChange}
                pagination={true}
                data={table.data}/>
        </ShadowCard>
        <AddPermissionModal visible={addVisible} onCancel={() => {setAddVisible(false)}} onSuccess={() => {
            setAddVisible(false)
            onRefresh()
        }}/>
    </Content>
}

export default PermissionPage