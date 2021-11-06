import {useCallback, useEffect, useState} from "react";
import {useHistory, useLocation} from "react-router-dom";
import {GetParamValue} from "../../../utils/path";
import {Button, Col, Dropdown, Menu, message, Row, Space} from "antd";
import {Device} from "../../../types/device";
import {GetDeviceRequest} from "../../../apis/device";
import {Content} from "antd/lib/layout/layout";
import InformationCard from "./information";
import ShadowCard from "../../../components/shadowCard";
import MonitorPage from "./monitor";
import AlertPage from "./alert";
import {DownOutlined} from "@ant-design/icons";
import {DeviceCommand} from "../../../types/device_command";
import SettingPage from "./setting";
import {DeviceType} from "../../../types/device_type";

const tabList = [
    {
        key: "monitor",
        tab: "监控",
    },
    {
        key: "alert",
        tab: "报警记录"
    },
    // {
    //     key: "event",
    //     tab: "事件",
    // }
]

const DeviceDetailPage = () => {
    const location = useLocation<any>()
    const history = useHistory()
    const [device, setDevice] = useState<Device>()
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [currentKey, setCurrentKey] = useState<string>("monitor")

    const contents = new Map<string, any>([
        ["monitor", <MonitorPage device={device}/>],
        ["alert", <AlertPage device={device}/>],
        ["setting", <SettingPage device={device}/>],
        // ["event", <a/>]
    ])

    const fetchDevice = useCallback(() => {
        const id = GetParamValue(location.search, "id")
        if (id && !!Number(id)) {
            setIsLoading(true)
            GetDeviceRequest(Number(id)).then(res => {
                setIsLoading(false)
                if (res.code === 200) {
                    setDevice(res.data)
                } else {
                    message.error("设备不存在").then()
                    history.push({pathname: "/device-management/devices"})
                }
            })
        } else {
            message.error("设备不存在").then()
            history.push({pathname: "/device-management/devices"})
        }
    }, [])

    useEffect(() => {
        fetchDevice()
    }, [fetchDevice])

    const renderTabList = () => {
        if (device && device.typeId !== DeviceType.Router) {
            return [
                tabList[0],
                {
                    key: "setting",
                    tab: "配置信息"
                },
                ...tabList.slice(1)
            ]
        }
        return tabList
    }

    const renderCommandMenu = () => {
        return <Menu>
            <Menu.Item key={DeviceCommand.Reboot}>重启</Menu.Item>
            <Menu.Item key={DeviceCommand.Reset}>恢复出厂设置</Menu.Item>
        </Menu>
    }

    return <div>
        <Row justify="center">
            <Col span={24} style={{textAlign: "right"}}>
                <Space>
                    <Dropdown overlay={renderCommandMenu}>
                        <Button type={"primary"}>设备命令<DownOutlined/></Button>
                    </Dropdown>
                </Space>
            </Col>
        </Row>
        <Row justify="center">
            <Col span={24}>
                <Content style={{paddingTop: "15px"}}>
                    {
                        device && <InformationCard device={device} isLoading={isLoading}/>
                    }
                    <br/>
                    <ShadowCard size={"small"} tabList={renderTabList()} onTabChange={key => {
                        setCurrentKey(key)
                    }}>
                        {contents.get(currentKey)}
                    </ShadowCard>
                </Content>
            </Col>
        </Row>
    </div>
}

export default DeviceDetailPage