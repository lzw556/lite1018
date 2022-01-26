import {Header} from "antd/es/layout/layout";
import {Button, Col, Dropdown, Menu, Row, Space, Typography} from "antd";
import "../../App.css";
import "./layout.css"
import "../../assets/iconfont.css"
import {NavLink} from "react-router-dom";
import logo from "../../assets/images/logo-dark.png";
import {CaretDownOutlined, CreditCardOutlined, DashboardOutlined, UserOutlined} from "@ant-design/icons";
import {persistor, store} from "../../store";
import {useState} from "react";
import moment from "moment";
import ProjectSelect from "../../components/select/projectSelect";
import {getProject} from "../../utils/session";

const {Text} = Typography;

const HeaderLayout = (props: any) => {
    const {hideConsole} = props
    const [currentUser] = useState<any>(store.getState().auth.data.user)
    const [now, setNow] = useState<string>(moment().format("YYYY-MM-DD HH:mm:ss"))

    setInterval(() => {
        setNow(moment().format("YYYY-MM-DD HH:mm:ss"))
    }, 1000)

    const onLogout = () => {
        persistor.purge().then(_ => {
            window.location.reload()
        })
    }

    const onProjectChange = (value: any) => {
        store.dispatch({
            type: "SET_PROJECT",
            payload: value
        })
        window.location.reload()
    }

    const menu = (
        <Menu onClick={onLogout}>
            <Menu.Item key={1}>退出登录</Menu.Item>
        </Menu>
    )

    return <Header className="ts-header">
        <Row justify="start">
            <Col span={6}>
                <Space className={"ts-title"}>
                    <img src={logo} width={100} alt="ThetaSensors" style={{verticalAlign: "middle"}}/>
                    云监控平台
                </Space>
            </Col>
            <Col span={18}>
                <Row justify={"end"}>
                    <Col offset={1} xl={4} xxl={3}>
                        <Space>
                            <Text style={{color: "white"}} strong>{now}</Text>
                        </Space>
                    </Col>
                    <Col xl={3} xxl={2}>
                        {
                            currentUser && <ProjectSelect bordered={false}
                                                          defaultValue={getProject()}
                                                          defaultActiveFirstOption={true}
                                                          suffixIcon={<CaretDownOutlined style={{color: "white"}}/>}
                                                          style={{width: "120px", textAlign: "center", backgroundColor: "transparent", color:"white"}}
                                                          size={"small"} onChange={onProjectChange}/>
                        }
                    </Col>
                    <Col xl={3} xxl={2}>
                        <Dropdown overlay={menu}>
                            <Space>
                                <Button type={"text"} style={{color: "#fff"}}><UserOutlined/>{currentUser?.username}
                                </Button>
                            </Space>
                        </Dropdown>
                    </Col>
                    <Col span={2} hidden={true}>
                        <Space>
                            <NavLink to="/asset-management?locale=assetMonitor"
                                     className="ts-menu"><CreditCardOutlined/> 控制台</NavLink>
                        </Space>
                    </Col>
                    <Col span={3} hidden={true}>
                        <Space>
                            <NavLink to="/dashboard" className="ts-menu"><DashboardOutlined/> 监控大屏</NavLink>
                        </Space>
                    </Col>
                </Row>
            </Col>
        </Row>
    </Header>
}

export default HeaderLayout