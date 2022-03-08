import {useCallback, useEffect, useState} from "react";
import {useHistory, useLocation} from "react-router-dom";
import {GetParamValue} from "../../../utils/path";
import {Button, Col, Dropdown, Menu, message, Row, Space} from "antd";
import {Device} from "../../../types/device";
import {DeviceUpgradeRequest, GetDeviceRequest, SendDeviceCommandRequest} from "../../../apis/device";
import {Content} from "antd/lib/layout/layout";
import InformationCard from "./information";
import ShadowCard from "../../../components/shadowCard";
import {DownOutlined} from "@ant-design/icons";
import {DeviceCommand} from "../../../types/device_command";
import SettingPage from "./setting";
import {DeviceType} from "../../../types/device_type";
import MyBreadcrumb from "../../../components/myBreadcrumb";
import HasPermission from "../../../permission";
import userPermission, {Permission} from "../../../permission/permission";
import HistoryDataPage from "./data";
import WaveDataChart from "./waveData";
import useSocket, {SocketTopic} from "../../../socket";
import { DeviceMonitor } from "../DeviceMonitor";
import { RuntimeChart } from "../RuntimeChart";
import { IsUpgrading } from "../../../types/device_upgrade_status";
import UpgradeModal from "../upgrade";
import DeviceEvent from "./event";

const tabList = [
    {
        key: "settings",
        tab: "配置信息",
    },
    {
        key: "ta",
        tab: "TA(状态历史)",
    }
]
const tabTitleList = [   
    {
        key: "monitor",
        tab: "监控",
    },
    {
        key: "historyData",
        tab: "历史数据"
    }
]

const DeviceDetailPage = () => {
    const location = useLocation<any>();
    const history = useHistory();
    const {PubSub} = useSocket();
    const [device, setDevice] = useState<Device>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [currentKey, setCurrentKey] = useState<string>('');
    const {hasPermission, hasPermissions} = userPermission();
    const [upgradeVisible, setUpgradeVisible] = useState<boolean>(false)
    const [upgradeStatus, setUpgradeStatus] = useState<any>()

    const contents = new Map<string, any>([
        ["settings", device && <SettingPage device={device}/>],
        ["historyData", device && <HistoryDataPage device={device}/>],
        ["waveData", device && <WaveDataChart device={device}/>],
        ['monitor',device && <DeviceMonitor device={device}/>],
        ['ta',device && <RuntimeChart deviceId={device.id}/>],
        ['events', device && <DeviceEvent device={device}/>]
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
                .catch(_ => window.location.hash = "/device-management?locale=devices")
        } else {
            message.error("设备不存在").then()
            window.location.hash = "/device-management?locale=devices"
        }
    }, []);

    useEffect(() => {
        fetchDevice();
    }, [fetchDevice])

    useEffect(() => {
        if (device) {
            PubSub.subscribe(SocketTopic.connectionState, (msg: any, state: any) => {
                if (device.macAddress === state.macAddress){
                    setDevice({...device, state: {...device.state, isOnline: state.isOnline}})
                }
            })
            PubSub.subscribe(SocketTopic.upgradeStatus, (msg:string, status:any) => {
                if (device.macAddress === status.macAddress) {
                    setUpgradeStatus({code: status.code, progress: status.progress});
                }
            });
            if(device.typeId===DeviceType.Gateway||device.typeId===DeviceType.Router){
                setCurrentKey(tabList[0].key)
            }else{
                setCurrentKey(tabTitleList[0].key)
            }
        }
        return () => {
            PubSub.unsubscribe(SocketTopic.upgradeStatus);
            PubSub.unsubscribe(SocketTopic.connectionState)
        }
    }, [device])

    const renderTabList = () => {
        if (device) {
            switch (device.typeId) {
                case DeviceType.VibrationTemperature3Axis:
                    return [
                        ...tabTitleList,
                        {
                            key: "waveData",
                            tab: "波形数据"
                        },
                        ...tabList
                    ]
                case DeviceType.Gateway:
                    return tabList
                case DeviceType.Router:
                    return tabList
                default:
                    if (hasPermission(Permission.DeviceEventList)) {
                        return [
                            ...tabTitleList,
                            ...tabList,
                            {
                                key: "events",
                                tab: "事件",
                            }
                        ]
                    }
                    return [
                        ...tabTitleList,
                        ...tabList,
                    ]
            }
        }
    }

    const onCommand = ({key}: any) => {
        if (device) {
            switch (Number(key)) {
                case DeviceCommand.Upgrade:
                    setDevice(device)
                    setUpgradeVisible(true)
                    break
                case DeviceCommand.CancelUpgrade:
                    DeviceUpgradeRequest(device.id, {type: DeviceCommand.CancelUpgrade}).then(res => {
                        if (res.code === 200) {
                            message.success("取消升级成功").then()
                        } else {
                            message.error(`取消升级失败,${res.msg}`).then()
                        }
                    })
                    break
            
                default:
                    SendDeviceCommandRequest(device.id, key).then(res => {
                        if (res.code === 200) {
                            message.success("发送成功").then()
                        } else {
                            message.error("发送失败").then()
                        }
                    })
                    break;
            }           
        }
    }

    const renderCommandMenu = () => {
        const isOnline = device && device.state.isOnline
        const isUpgrading = device && upgradeStatus && IsUpgrading(upgradeStatus.code)
        return <Menu onClick={onCommand}>
            <Menu.Item key={DeviceCommand.Reboot} disabled={!isOnline} hidden={isUpgrading}>重启</Menu.Item>
            {
                device && device.typeId !== DeviceType.Router &&
                device.typeId !== DeviceType.Gateway &&
                <Menu.Item key={DeviceCommand.ResetData} disabled={!isOnline} hidden={isUpgrading}>重置数据</Menu.Item>
            }
            <Menu.Item key={DeviceCommand.Reset} disabled={!isOnline} hidden={isUpgrading}>恢复出厂设置</Menu.Item>
            {hasPermissions(Permission.DeviceUpgrade, Permission.DeviceFirmwares) &&
                (<>
                    <Menu.Item key={DeviceCommand.Upgrade} disabled={!isOnline} hidden={isUpgrading}>固件升级</Menu.Item>
                    <Menu.Item key={DeviceCommand.CancelUpgrade} hidden={!isUpgrading}>取消升级</Menu.Item>
                </>)}
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
                        {currentKey && contents.get(currentKey)}
                    </ShadowCard>
                }
            </Col>
        </Row>
        {
            device &&
            <UpgradeModal visible={upgradeVisible} device={device} onSuccess={() => {               
                setUpgradeVisible(false)
            }} onCancel={() => {
                setUpgradeVisible(false)
            }}/>
        }
    </Content>
}

export default DeviceDetailPage