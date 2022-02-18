import {Col, Row, Skeleton, Space, Tag, Typography} from "antd";
import {FC, useEffect, useState} from "react";
import {Device} from "../../../../types/device";
import "../../index.css"
import moment from "moment";
import ShadowCard from "../../../../components/shadowCard";
import {ColorHealth, ColorWarn} from "../../../../constants/color";
import "../../../../string-extension";
import useSocket, {SocketTopic} from "../../../../socket";
import DeviceUpgradeSpin from "../../spin/deviceUpgradeSpin";
import {DeviceType} from "../../../../types/device_type";

export interface GatewayInformationProps {
    device: Device
    isLoading: boolean
}

const {Text} = Typography;

const InformationCard: FC<GatewayInformationProps> = ({device, isLoading}) => {
    const [upgradeStatus, setUpgradeStatus] = useState<any>(device.upgradeStatus);
    const {PubSub} = useSocket();

    useEffect(() => {
        PubSub.subscribe(SocketTopic.upgradeStatus, (msg:string, status:any) => {
            if (device.macAddress === status.macAddress) {
                setUpgradeStatus({code: status.code, progress: status.progress});
            }
            setUpgradeStatus({});
        });
        return () => {
            PubSub.unsubscribe(SocketTopic.upgradeStatus);
        }
    }, [])

    return <ShadowCard>
        <Skeleton loading={isLoading}>
            <Row justify={"start"}>
                <Col span={3} className="ts-detail-label">
                    设备名称
                </Col>
                <Col span={6}>
                    <Space>
                        {
                            device.name
                        }
                        {
                            upgradeStatus && upgradeStatus.id === device.id && (
                                <DeviceUpgradeSpin status={upgradeStatus.status}/>)
                        }
                    </Space>
                </Col>
                <Col span={3} className="ts-detail-label">
                    类型
                </Col>
                <Col span={6}>
                    {
                        DeviceType.toString(device.typeId)
                    }
                </Col>
            </Row>
            <br/>
            <Row justify={"start"}>
                <Col span={3} className="ts-detail-label">
                    MAC地址
                </Col>
                <Col span={6}>
                    <Text copyable={{text: device.macAddress, tooltips: ["复制", "复制成功"]}}>
                        {
                            device.macAddress.toUpperCase().macSeparator()
                        }
                    </Text>
                </Col>
                <Col span={3} className="ts-detail-label">
                    型号
                </Col>
                <Col span={6}>
                    {
                        device.information.model ? device.information.model : "-"
                    }
                </Col>
            </Row>
            <br/>
            <Row justify={"start"}>
                <Col span={3} className="ts-detail-label">
                    状态
                </Col>
                <Col span={6}>
                    {
                        device.state && device.state.isOnline ? (<Tag color={ColorHealth}>在线</Tag>) : (
                            <Tag color={ColorWarn}>离线</Tag>)
                    }
                </Col>
                <Col span={3} className="ts-detail-label">
                    所属网络
                </Col>
                <Col span={6}>
                    {
                        device.network ? device.network.name : "无"
                    }
                </Col>
            </Row>
            <br/>
            <Row justify={"start"}>
                <Col span={3} className="ts-detail-label">
                    电池电压(mV)
                </Col>
                <Col span={6}>
                    {
                        device.state ? device.state.batteryVoltage : "-"
                    }
                </Col>
                <Col span={3} className="ts-detail-label">
                    固件版本号
                </Col>
                <Col span={6}>
                    {
                        device.information.firmware_version ? device.information.firmware_version : "-"
                    }
                </Col>
            </Row>
            <br/>
            <Row justify={"start"}>
                <Col span={3} className="ts-detail-label">
                    信号强度(dB)
                </Col>
                <Col span={6}>
                    {
                        device.state ? device.state.signalLevel : "-"
                    }
                </Col>
                <Col span={3} className="ts-detail-label">
                    固件编译时间
                </Col>
                <Col span={6}>
                    {
                        device.information.firmware_build_time ? moment(device.information.firmware_build_time).format("YYYY-MM-DD HH:mm:ss") : "-"
                    }
                </Col>
            </Row>
            <br/>
            <Row justify={"start"}>
                <Col span={3} className="ts-detail-label">
                    最近连接时间
                </Col>
                <Col span={6}>
                    {
                        device.state.connectedAt ? moment(device.state.connectedAt * 1000).format("YYYY-MM-DD HH:mm:ss") : "-"
                    }
                </Col>
                <Col span={3} className="ts-detail-label">
                    硬件版本
                </Col>
                <Col span={6}>
                    {
                        device.information.product_id ? device.information.product_id : "-"
                    }
                </Col>
            </Row>
            <br/>
            <Row justify={"start"}>
                <Col span={3} className="ts-detail-label">
                    生产厂商
                </Col>
                <Col span={6}>
                    {
                        device.information.manufacturer ? device.information.manufacturer : "-"
                    }
                </Col>
                <Col span={3} className="ts-detail-label" hidden={device.typeId !== DeviceType.Gateway}>
                    IP地址
                </Col>
                <Col span={6} hidden={device.typeId !== DeviceType.Gateway}>
                    {
                        device.information.ip_address ?
                            (<Space>{device.information.ip_address} <a href={`http://${device.information.ip_address}`}
                                                                       target={"_blank"}
                                                                       style={{fontSize: "10pt"}}>访问管理界面</a></Space>) :
                            "-"
                    }
                </Col>
            </Row>
        </Skeleton>
    </ShadowCard>
}

export default InformationCard