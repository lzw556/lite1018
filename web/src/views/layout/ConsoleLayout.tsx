import {Layout, Menu} from "antd";
import "../../App.css";
import "./layout.css"
import {NavLink} from "react-router-dom";
import RouterGuard from "../../routers/routerGuard";
import {HeaderLayout} from "./index";
import AlertNotification from "../../components/alertNotification";

const {SubMenu} = Menu
const {Sider} = Layout

const ConsoleLayout = (props: any) => {
    const {menus, location} = props
    const {pathname} = location

    const renderMenuItem = (children: []) => {
        return children.map((item: any) => {
            if (!item.hidden) {
                if (item.children && item.children.filter((item:any) => !item.hidden).length) {
                    return <SubMenu key={item.path} title={item.title}>
                        {renderMenuItem(item.children)}
                    </SubMenu>
                }
                return <Menu.Item key={item.path}>
                    <NavLink to={item.path}>{item.title}</NavLink>
                </Menu.Item>
            }
        })
    }

    const flattenRoutes: any = (routes:any[]) => {
        return routes.reduce((acc: any, curr: any) => {
            acc.push(curr)
            return acc.concat(curr.children ? flattenRoutes(curr.children) : [])
        }, [])
    }
    const routes = flattenRoutes(menus)

    const renderDefaultOpenKeys = () => {
        const keys = pathname.split('/')
        if (keys && keys.length > 1) {
            return ['/' + keys[1]]
        }
        return ["/device-management"]
    }

    return <Layout className="ts-console">
        <HeaderLayout hideConsole={true}/>
        <Layout>
            <Sider width={200} style={{background: "white", height: "100%", overflowY: "scroll", boxShadow: "0 2px 10px 0 rgba(0,0,0, 0.08)"}}>
                <Menu mode="inline" className="ts-menu" defaultSelectedKeys={["devices"]}
                      selectedKeys={[pathname]} defaultOpenKeys={renderDefaultOpenKeys()}>
                    {
                        menus.map((item: any) => {
                            if (!item.hidden) {
                                if (item.children && item.children.filter((item:any) => !item.hidden).length) {
                                    return <SubMenu key={item.path} title={item.title}
                                                    icon={<item.icon/>}>
                                        {renderMenuItem(item.children)}
                                    </SubMenu>
                                }
                                return <Menu.Item key={item.path} icon={<item.icon/>}>
                                    <NavLink to={item.path}>{item.title}</NavLink>
                                </Menu.Item>
                            }
                        })
                    }
                </Menu>
            </Sider>
            <Layout style={{padding: "15px", background: "#eef0f5", overflowY: "scroll"}}>
                <RouterGuard {...props} routes={routes}/>
            </Layout>
        </Layout>
        <AlertNotification />
    </Layout>
}

export default ConsoleLayout