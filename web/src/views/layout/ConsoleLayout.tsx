import {Layout, Menu} from "antd";
import "../../App.css";
import "./layout.css"
import {NavLink} from "react-router-dom";
import RouterGuard from "../../routers/routerGuard";
import {HeaderLayout} from "./index";
import AlertNotification from "../../components/alertNotification";
import "../../assets/iconfont.css"
import React from "react";
import {GetParamValue} from "../../utils/path";
import {SecondaryRoutes} from "../../routers/routes";

const {SubMenu} = Menu
const {Sider} = Layout

const ConsoleLayout = (props: any) => {
    const {menus, location} = props
    const {pathname} = location
    const locale = GetParamValue(location.search, "locale")

    const renderMenuItem = (children: []) => {
        return children.map((item: any) => {
            if (!item.hidden) {
                if (item.children && item.children.filter((item: any) => !item.hidden).length) {
                    return <SubMenu key={item.name} title={item.title}>
                        {renderMenuItem(item.children)}
                    </SubMenu>
                }
                return <Menu.Item key={item.name}>
                    <NavLink to={`${item.path}?locale=${item.name}`}>{item.title}</NavLink>
                </Menu.Item>
            }
        })
    }

    const flattenRoutes: any = (children: any) => {
        return children.reduce((acc: any, curr: any) => {
            acc.push(curr)
            return acc.concat(curr.children ? flattenRoutes(curr.children) : [])
        }, [])
    }

    return <Layout className="ts-console">
        <HeaderLayout hideConsole={true}/>
        <Layout>
            <Sider width={200} style={{
                background: "white",
                height: "100%",
                overflowY: "scroll",
                boxShadow: "0 2px 10px 0 rgba(0,0,0, 0.08)"
            }}>
                {
                    menus && menus.length &&
                    <Menu mode="inline" className="ts-menu" defaultSelectedKeys={["devices"]}
                          selectedKeys={locale ? locale.split("/") : []} defaultOpenKeys={[pathname.replace("/", "")]}>
                        {
                            menus && menus.map((item: any) => {
                                if (!item.hidden) {
                                    if (item.children && item.children.filter((item: any) => !item.hidden).length) {
                                        return <SubMenu key={item.name} title={item.title}
                                                        icon={item.icon &&
                                                        <span className={`iconfont ${item.icon}`}/>}>
                                            {renderMenuItem(item.children)}
                                        </SubMenu>
                                    }
                                    return <Menu.Item key={item.name}
                                                      icon={item.icon &&
                                                      <span className={`iconfont ${item.icon}`}/>}>
                                        <NavLink to={`${item.path}?locale=${item.name}`}>{item.title}</NavLink>
                                    </Menu.Item>
                                }
                            })
                        }
                    </Menu>
                }
            </Sider>
            <Layout style={{padding: "15px", background: "#eef0f5", overflowY: "scroll"}}>
                {
                    <RouterGuard {...props} routes={SecondaryRoutes.concat(flattenRoutes(menus))}/>
                }
            </Layout>
        </Layout>
        <AlertNotification/>
    </Layout>
}

export default ConsoleLayout