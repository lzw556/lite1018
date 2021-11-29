import MyBreadcrumb from "../../../components/myBreadcrumb";
import {Button, message, Popconfirm, Space} from "antd";
import {DeleteOutlined, EditOutlined, PlusOutlined} from "@ant-design/icons";
import {Content} from "antd/es/layout/layout";
import TableLayout, {TableProps} from "../../layout/TableLayout";
import ShadowCard from "../../../components/shadowCard";
import {useCallback, useState} from "react";
import {GetRoleRequest, PagingRolesRequest} from "../../../apis/role";
import AddRoleModal from "./modal/add";
import EditRoleModal from "./modal/edit";
import {Role} from "../../../types/role";
import MenuDrawer from "./menuDrawer";

const RolePage = () => {
    const [addVisible, setAddVisible] = useState(false);
    const [editVisible, setEditVisible] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [role, setRole] = useState<Role>()
    const [table, setTable] = useState<TableProps>({
        refreshKey: 0,
        data: {},
        isLoading: false,
        pagination: true
    })

    const onChange = useCallback((current, size) => {
        PagingRolesRequest(current, size).then(res => {
            if (res.code === 200) {
                setTable({...table, data: res.data})
            }
        })
    }, [])

    const onRefresh = () => {
        setTable({...table, refreshKey: table.refreshKey + 1})
    }

    const onAllocMenus = (id:number) => {
        GetRoleRequest(id).then(res => {
            if (res.code === 200) {
                setRole(res.data)
                setMenuVisible(true)
            }else {
                message.error(res.msg)
            }
        })
    }

    const columns = [
        {
            title: '角色名称',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '角色描述',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: '操作',
            key: 'action',
            render: (text:string, record:any) => {
                return <Space>
                    <Button type={"link"} size={"small"} onClick={() => {
                        onAllocMenus(record.id)
                    }}>分配菜单</Button>
                    <Button type="text" size="small" icon={<EditOutlined/>} onClick={() => {
                        setEditVisible(true)
                        setRole(record)
                    }}/>
                    <Popconfirm placement="left" title="确认要删除该角色吗?"
                                okText="删除" cancelText="取消">
                        <Button type="text" size="small" icon={<DeleteOutlined/>} danger/>
                    </Popconfirm>
                </Space>
            },
        }
    ]

    return <Content>
        <MyBreadcrumb items={["系统管理", "角色管理"]}>
                <Button type={"primary"} onClick={() => setAddVisible(true)}>添加角色 <PlusOutlined /></Button>
        </MyBreadcrumb>
        <ShadowCard>
            <TableLayout
                emptyText={"角色列表为空"}
                columns={columns}
                isLoading={table.isLoading}
                refreshKey={table.refreshKey}
                onChange={onChange}
                pagination={true}
                data={table.data}/>
        </ShadowCard>
        <AddRoleModal visible={addVisible} onCancel={() => setAddVisible(false)} onSuccess={() => {
            setAddVisible(false)
            onRefresh()
        }}/>
        <EditRoleModal role={role} visible={editVisible} onCancel={() => setEditVisible(false)} onSuccess={
            () => {
                setEditVisible(false)
                onRefresh()
            }
        }/>
        <MenuDrawer role={role} visible={menuVisible} onCancel={() => setMenuVisible(false)}/>
    </Content>
}

export default RolePage