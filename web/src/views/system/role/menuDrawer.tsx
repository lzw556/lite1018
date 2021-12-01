import {Button, Drawer, DrawerProps, Space, Tree} from "antd";
import {FC, useEffect, useState} from "react";
import {Role} from "../../../types/role";
import {GetMenusTreeRequest} from "../../../apis/menu";
import {Menu} from "../../../types/menu";
import {AllocMenusRequest} from "../../../apis/role";
import "../../../assets/iconfont.css"

export interface MenuDrawerProps extends DrawerProps {
    role?: Role
    onCancel: () => void
}

const MenuDrawer: FC<MenuDrawerProps> = (props) => {
    const {role, visible, onCancel} = props;
    const [menus, setMenus] = useState<Menu[]>();
    const [checkMenus, setCheckMenus] = useState<number[]>([])

    useEffect(() => {
        if (role) {
            GetMenusTreeRequest().then(data => {
                setMenus(data)
                setCheckMenus(role.menus)
            })
        } else {
            onCancel()
        }
    }, [role])

    const onSave = () => {
        if (role) {
            AllocMenusRequest(role.id, checkMenus).then(_ => {
                onCancel()
            })
        }
    }

    const renderExtra = () => {
        return <Space>
            <Button onClick={onCancel}>取消</Button>
            <Button type={"primary"} onClick={onSave}>保存</Button>
        </Space>
    }

    const onCheck = (checkKeys: any, e: any) => {
        setCheckMenus(checkKeys.concat(e.halfCheckedKeys))
    }

    const renderDefaultCheckedKeys = () => {
        const parentKeys = menus?.filter(menu => menu.path === '').map(menu => menu.id)
        return role?.menus.filter(id => !parentKeys?.includes(id))
    }

    const renderMenusTree = () => {
        if (menus && visible) {
            return <Tree checkable defaultExpandAll={true} showIcon={true} selectable={false}
                         defaultCheckedKeys={renderDefaultCheckedKeys()} treeData={convertTreeData(menus)}
                         onCheck={onCheck}/>
        }
    }

    const convertTreeData = (children: Menu[]) => {
        return children.filter(item => !item.hidden).map(menu => {
            const data: any = {
                title: menu.title,
                key: menu.id,
            }
            if (menu.children) {
                data.children = convertTreeData(menu.children)
            }
            if (menu.icon) {
                data.icon = <span className={`iconfont ${menu.icon}`}/>
            }
            return data
        })
    }

    return <Drawer {...props} title={role?.name} placement={"right"} onClose={onCancel} extra={renderExtra()}>
        {
            renderMenusTree()
        }
    </Drawer>
}

export default MenuDrawer;