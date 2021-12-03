import MyBreadcrumb from "../../../components/myBreadcrumb";
import {Button, Popconfirm, Space} from "antd";
import {DeleteOutlined, EditOutlined, PlusOutlined} from "@ant-design/icons";
import {Content} from "antd/es/layout/layout";
import TableLayout, {TableProps} from "../../layout/TableLayout";
import ShadowCard from "../../../components/shadowCard";
import {useCallback, useState} from "react";
import {GetRoleRequest, PagingRolesRequest, RemoveRoleRequest} from "../../../apis/role";
import AddRoleModal from "./modal/add";
import EditRoleModal from "./modal/edit";
import {Role} from "../../../types/role";
import MenuDrawer from "./menuDrawer";
import PermissionDrawer from "./permissionDrawer";
import HasPermission from "../../../permission";
import usePermission, {Permission} from "../../../permission/permission";

const RolePage = () => {
    const [addVisible, setAddVisible] = useState(false);
    const [editVisible, setEditVisible] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [permissionVisible, setPermissionVisible] = useState(false);
    const [role, setRole] = useState<Role>()
    const [table, setTable] = useState<TableProps>({
        refreshKey: 0,
        data: {},
        isLoading: false,
        pagination: true
    })
    const {hasPermission} = usePermission()

    const onChange = useCallback((current, size) => {
        PagingRolesRequest(current, size).then(data => {
            setTable({...table, data: data})
        })
    }, [])

    const onRefresh = () => {
        setTable({...table, refreshKey: table.refreshKey + 1})
    }

    const onAllocMenus = (id: number) => {
        GetRoleRequest(id).then(data => {
            setRole(data)
            setMenuVisible(true)
        })
    }

    const onAllocPermissions = (id: number) => {
        GetRoleRequest(id).then(data => {
            setRole(data)
            setPermissionVisible(true)
        })
    }

    const onDelete = (id: number) => {
        RemoveRoleRequest(id).then(_ => {
                onRefresh()
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
            render: (text: string, record: any) => {
                return <Space>
                    {
                        hasPermission(Permission.RoleAllocMenus) &&
                        <Button type={"link"} size={"small"} onClick={() => {
                            onAllocMenus(record.id)
                        }}>分配菜单</Button>
                    }
                    {
                        hasPermission(Permission.RoleAllocPermissions) &&
                        <Button type={"link"} size={"small"} onClick={() => {
                            onAllocPermissions(record.id)
                        }}>分配权限</Button>
                    }
                    {
                        hasPermission(Permission.RoleEdit) &&
                        <Button type="text" size="small" icon={<EditOutlined/>} onClick={() => {
                            setEditVisible(true)
                            setRole(record)
                        }}/>
                    }
                    <HasPermission value={Permission.RoleDelete}>
                        <Popconfirm placement="left" title="确认要删除该角色吗?"
                                    okText="删除" cancelText="取消" onConfirm={() => {
                            onDelete(record.id)
                        }}>
                            <Button type="text" size="small" icon={<DeleteOutlined/>} danger/>
                        </Popconfirm>
                    </HasPermission>
                </Space>
            },
        }
    ]

    return <Content>
        <MyBreadcrumb>
            <HasPermission value={Permission.RoleAdd}>
                <Button type={"primary"} onClick={() => setAddVisible(true)}>添加角色 <PlusOutlined/></Button>
            </HasPermission>
        </MyBreadcrumb>
        <ShadowCard>
            <TableLayout
                emptyText={"角色列表为空"}
                permissions={[Permission.RoleAllocMenus, Permission.RoleAllocPermissions, Permission.RoleDelete]}
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
        <PermissionDrawer role={role} visible={permissionVisible} onCancel={() => setPermissionVisible(false)}/>
    </Content>
}

export default RolePage