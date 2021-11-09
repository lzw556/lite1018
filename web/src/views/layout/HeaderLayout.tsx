import { Header } from "antd/es/layout/layout";
import { Button, Col, Dropdown, Menu, Row, Space } from "antd";
import "../../App.css";
import "./layout.css"
import { NavLink } from "react-router-dom";
import logo from "../../assets/images/logo-dark.png";
import { UserOutlined } from "@ant-design/icons";
import { store } from "../../store";


const HeaderLayout = (props: any) => {
    const { hideConsole } = props
    const menu = (
        <Menu>
            <Menu.Item>退出登录</Menu.Item>
        </Menu>
    )

    return <Header className="ts-header">
        <Row justify="space-around">
            <Col span={6}>
                <Space className={"ts-title"}>
                    <img src={logo} width={100} alt="ThetaSensors" style={{ verticalAlign: "middle" }} />
                    云监控平台
                </Space>
            </Col>
            <Col span={10} />
            <Col span={2}>
                <Dropdown overlay={menu}>
                    <Space>
                        <Button type={"text"} style={{color:"#fff"}}><UserOutlined />{store.getState().auth.data.user.username}</Button>
                    </Space>
                </Dropdown>
            </Col>
            <Col span={2} hidden={hideConsole}>
                <NavLink to="/device-management/devices" className="ts-menu">控制台</NavLink>
            </Col>
        </Row>
    </Header>
}

export default HeaderLayout