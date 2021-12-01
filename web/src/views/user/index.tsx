import {Button, Col, Popconfirm, Row, Space} from "antd";
import {useCallback, useState} from "react";
import {Content} from "antd/lib/layout/layout";
import {GetUserRequest, PagingUsersRequest, RemoveUserRequest} from "../../apis/user";
import TableLayout, {TableProps} from "../layout/TableLayout";
import {InitializeUserState} from "../../types/user";
import {DeleteOutlined, EditOutlined, UserAddOutlined} from "@ant-design/icons";
import AddUserModal from "./add";
import EditUserModal from "./edit";
import ShadowCard from "../../components/shadowCard";
import MyBreadcrumb from "../../components/myBreadcrumb";
import HasPermission from "../../permission";
import {Permission} from "../../permission/permission";

const UserPage = () => {
    const [addUserVisible, setAddUserVisible] = useState<boolean>(false)
    const [editUserVisible, setEditUserVisible] = useState<boolean>(false)
    const [user, setUser] = useState(InitializeUserState)
    const [table, setTable] = useState<TableProps>({
        data: {},
        isLoading: false,
        pagination: false,
        refreshKey: 0
    })

    const onChange = useCallback((current: number, size: number) => {
        onLoading(true)
        PagingUsersRequest(current, size).then(data => {
            onLoading(false)
            setTable(old => Object.assign({}, old, {data: data}))
        })
    }, [])

    const onAddUserSuccess = () => {
        setAddUserVisible(false)
        onRefresh()
    }

    const onEditUserSuccess = () => {
        setEditUserVisible(false)
        onRefresh()
    }

    const onLoading = (isLoading: boolean) => {
        setTable(old => Object.assign({}, old, {isLoading: isLoading}))
    }

    const onRefresh = () => {
        setTable(old => Object.assign({}, old, {refreshKey: old.refreshKey + 1}))
    }

    const onDelete = (id: number) => {
        RemoveUserRequest(id).then(_ => onRefresh())
    }

    const onEdit = async (id: number) => {
        GetUserRequest(id).then(data => {
            setUser(data)
            setEditUserVisible(true)
        })
    }

    const columns = [
        {
            title: '用户名',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: '手机号',
            dataIndex: 'phone',
            key: 'phone'
        },
        {
            title: '邮箱',
            dataIndex: 'email',
            key: 'email'
        },
        {
            title: '操作',
            key: 'action',
            render: (text: any, record: any) => {
                return <Space>
                    <HasPermission value={Permission.UserEdit}>
                        <Button type="text" size="small" icon={<EditOutlined/>}
                                onClick={() => onEdit(record.id)}/>
                    </HasPermission>
                    <HasPermission value={Permission.UserDelete}>
                        <Popconfirm placement="left" title="确认要删除该用户吗?" onConfirm={() => onDelete(record.id)}
                                    okText="删除" cancelText="取消">
                            <Button type="text" size="small" icon={<DeleteOutlined/>} danger/>
                        </Popconfirm>
                    </HasPermission>
                </Space>
            },
        },
    ]


    return <Content>
        <MyBreadcrumb>
            <Space>
                <HasPermission value={Permission.UserAdd}>
                    <Button type="primary"
                            onClick={() => setAddUserVisible(true)}>
                        添加用户 <UserAddOutlined/>
                    </Button>
                </HasPermission>
            </Space>
        </MyBreadcrumb>
        <Row justify="center">
            <Col span={24}>
                <ShadowCard>
                    <TableLayout
                        columns={columns}
                        data={table.data}
                        isLoading={table.isLoading}
                        refreshKey={table.refreshKey}
                        pagination={true}
                        onChange={onChange}
                    />
                </ShadowCard>
            </Col>
        </Row>
        <AddUserModal visible={addUserVisible} onCancel={() => setAddUserVisible(false)} onSuccess={onAddUserSuccess}/>
        <EditUserModal user={user} visible={editUserVisible} onCancel={() => setEditUserVisible(false)}
                       onSuccess={onEditUserSuccess}/>
    </Content>
}

export default UserPage