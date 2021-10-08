import {Breadcrumb, Layout, Menu} from "antd";
import "../../App.css";
import "./layout.css"
import {NavLink} from "react-router-dom";
import RouterGuard from "../../routers/routerGuard";
import {HeaderLayout} from "./index";

const {SubMenu} = Menu
const {Sider} = Layout

const ConsoleLayout = (props: any) => {
    const {menus, location} = props
    const {pathname} = location

    const renderMenuItem = (children: []) => {
        return children.map((item: any) => {
            if (item.children && item.children.length) {
                return <SubMenu key={item.path} title={item.title}>
                    {renderMenuItem(item.children)}
                </SubMenu>
            }
            return <Menu.Item key={item.path}>
                <NavLink to={item.path}>{item.title}</NavLink>
            </Menu.Item>
        })
    }


    const travel = (routes: [], callback: any) => {
        routes.forEach((item: any) => {
            callback(item)
            if (item.children && item.children.length) {
                travel(item.children, callback)
            }
        })
    }

    const routes: any[] = []
    const breadcrumbItem: any = {}
    travel(menus, (item: any) => {
        routes.push(item)
        breadcrumbItem[item.name] = item
    })

    return <Layout className="ts-console">
        <HeaderLayout hideConsole={true}/>
        <Layout>
            <Sider width={200} style={{background: "white", height: "100%"}}>
                <Menu mode="inline" className="ts-menu" defaultSelectedKeys={["devices"]}
                      selectedKeys={[pathname]}
                      defaultOpenKeys={['/device-management']}>
                    {
                        menus.map((item: any) => {
                            if (item.children && item.children.length) {
                                return <SubMenu key={item.path} title={item.title}
                                                icon={<item.icon />}>
                                    {renderMenuItem(item.children)}
                                </SubMenu>
                            }
                            return <Menu.Item key={item.path} icon={<item.icon />}>
                                <NavLink to={item.path}>{item.title}</NavLink>
                            </Menu.Item>
                        })
                    }
                </Menu>
            </Sider>
            <Layout style={{padding: "15px", background: "#eef0f5"}}>
                <Breadcrumb className="ts-breadcrumb" style={{position:"absolute"}}>
                    {
                        pathname.split("/").map((path: string) => {
                            const item = breadcrumbItem[path]
                            return item ? <Breadcrumb.Item key={item.name}>{item.title}</Breadcrumb.Item> : null
                        })
                    }
                </Breadcrumb>
                <RouterGuard {...props} routes={routes}/>
            </Layout>
        </Layout>
    </Layout>
}

export default ConsoleLayout