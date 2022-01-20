import {Button, Drawer, DrawerProps, Space, Tree} from "antd";
import {Role} from "../../../types/role";
import {FC, useEffect, useState} from "react";
import {GetPermissionsWithGroupRequest} from "../../../apis/permission";
import {AllocPermissionsRequest} from "../../../apis/role";
import usePermission, {Permission} from "../../../permission/permission";
import HasPermission from "../../../permission";

export interface PermissionDrawerProps extends DrawerProps {
    role: Role
    onCancel: () => void
}

const PermissionDrawer: FC<PermissionDrawerProps> = (props) => {
    const {role, visible, onCancel} = props;
    const [permissions, setPermissions] = useState<any>();
    const [checkPermissions, setCheckPermissions] = useState<any[]>([]);
    const {hasPermission} = usePermission();

    useEffect(() => {
        if (visible) {
            GetPermissionsWithGroupRequest().then(res => {
                if (res.code === 200) {
                    setPermissions(res.data)
                    convertCheckPermissions(res.data)
                }
            })
        }
    }, [visible])

    const onSave = () => {
        AllocPermissionsRequest(role.id, checkPermissions.filter(item => (typeof item !== "string"))).then(_ => {
            onCancel()
        })
    }

    const convertCheckPermissions = (data: any) => {
        const ps = role.permissions.map((item: any) => `${item[0]}::${item[1]}`)
        const checked: any[] = []
        Object.keys(data).forEach(key => {
            data[key].filter((item: any) => {
                return ps.includes(`${item.path}::${item.method}`)
            }).forEach((item: any) => {
                checked.push(item.id)
            })
        })
        setCheckPermissions(checked)
    }

    const renderExtra = () => {
        return <Space>
            <Button onClick={onCancel}>取消</Button>
            <HasPermission value={Permission.RoleAllocPermissions}>
                <Button type={"primary"} onClick={onSave}>保存</Button>
            </HasPermission>
        </Space>
    }

    const onCheck = (checkKeys: any, e: any) => {
        setCheckPermissions(checkKeys)
    }

    const convertTreeData = () => {
        const treeData: any[] = [];
        Object.keys(permissions).forEach(key => {
            treeData.push({
                title: key,
                key: key,
                checkable: true,
                children: permissions[key].map((item: any) => {
                    return {
                        title: item.description,
                        key: item.id,
                    }
                })
            })
        })
        return treeData
    }

    const convertPermissionTree = () => {
        if (permissions && visible) {
            return <Tree defaultExpandAll={true}
                         checkable={true}
                         showIcon={true} selectable={false}
                         checkedKeys={checkPermissions} treeData={convertTreeData()}
                         onCheck={onCheck}/>
        }
    }

    return <Drawer {...props} title={role?.name} placement={"right"} onClose={onCancel} extra={renderExtra()}>
        {
            convertPermissionTree()
        }
    </Drawer>
}

export default PermissionDrawer;