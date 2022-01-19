import {useCallback, useEffect, useState} from "react";
import {useHistory, useLocation} from "react-router-dom";
import {GetParamValue} from "../../../utils/path";
import {Button, Col, Dropdown, Menu, message, Row, Space} from "antd";
import {Device} from "../../../types/device";
import {GetDeviceRequest, SendDeviceCommandRequest} from "../../../apis/device";
import {Content} from "antd/lib/layout/layout";
import InformationCard from "./information";
import ShadowCard from "../../../components/shadowCard";
import MonitorPage from "./monitor";
import {DownOutlined} from "@ant-design/icons";
import {DeviceCommand} from "../../../types/device_command";
import SettingPage from "./setting";
import {DeviceType} from "../../../types/device_type";
import MyBreadcrumb from "../../../components/myBreadcrumb";
import HasPermission from "../../../permission";
import userPermission, {Permission} from "../../../permission/permission";
import HistoryDataPage from "./data";

const tabList = [
    {
        key: "settings",
        tab: "配置信息",
    },
]

const DeviceDetailPage = () => {
    const location = useLocation<any>();
    const history = useHistory();
    const [device, setDevice] = useState<Device>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [currentKey, setCurrentKey] = useState<string>("monitor");
    const {hasPermission} = userPermission();

    const contents = new Map<string, any>([
        ["monitor", device && <MonitorPage device={device}/>],
        ["settings", <SettingPage device={device}/>],
        ["historyData", device && <HistoryDataPage device={device}/>]
    ])

    const fetchDevice = useCallback(() => {
        const id = GetParamValue(location.search, "id")
        if (id && !!Number(id)) {
            setIsLoading(true)
            GetDeviceRequest(Number(id))
                .then(data => {
                    setDevice(data)
                    setIsLoading(false)
                })
                .catch(_ => history.push({pathname: "/device-management/devices"}))
        } else {
            message.error("设备不存在").then()
            history.push({pathname: "/device-management/devices"})
        }
    }, [])

    useEffect(() => {
        fetchDevice()
    }, [fetchDevice])

    const renderTabList = () => {
        if (device &&
            device.typeId !== DeviceType.Router &&
            device.typeId !== DeviceType.Gateway &&
            hasPermission(Permission.DeviceData)) {
            return [
                {
                    key: "monitor",
                    tab: "监控",
                },
                ...tabList,
                {
                    key: "historyData",
                    tab: "历史数据"
                }
            ]
        }
        return tabList
    }

    const onCommand = ({key}: any) => {
        if (device) {
            SendDeviceCommandRequest(device.id, key).then(res => {
                if (res.code === 200) {
                    message.success("发送成功").then()
                } else {
                    message.error("发送失败").then()
                }
            })
        }
    }

    const renderCommandMenu = () => {
        const isOnline = device && device.state.isOnline
        return <Menu onClick={onCommand}>
            <Menu.Item key={DeviceCommand.Reboot} disabled={!isOnline}>重启</Menu.Item>
            {
                device && device.typeId !== DeviceType.Router &&
                device.typeId !== DeviceType.Gateway &&
                <Menu.Item key={DeviceCommand.ResetData} disabled={!isOnline}>重置数据</Menu.Item>
            }
            <Menu.Item key={DeviceCommand.Reset} disabled={!isOnline}>恢复出厂设置</Menu.Item>
        </Menu>
    }

    return <Content>
        <MyBreadcrumb>
            <Space>
                <HasPermission value={Permission.DeviceCommand}>
                    <Dropdown overlay={renderCommandMenu}>
                        <Button type={"primary"}>设备命令<DownOutlined/></Button>
                    </Dropdown>
                </HasPermission>
            </Space>
        </MyBreadcrumb>
        <Row justify="center">
            <Col span={24}>
                {
                    device && <InformationCard device={device} isLoading={isLoading}/>
                }
                <br/>
                {
                    device && <ShadowCard size={"small"} tabList={renderTabList()} onTabChange={key => {
                        setCurrentKey(key)
                    }}>
                        {contents.get(currentKey)}
                    </ShadowCard>
                }
            </Col>
        </Row>
    </Content>
}

export default DeviceDetailPage