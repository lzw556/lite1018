import MyBreadcrumb from "../../../components/myBreadcrumb";
import {Content} from "antd/es/layout/layout";
import ShadowCard from "../../../components/shadowCard";
import {Button, Col, Row, Space, Typography} from "antd";
import {useEffect, useState} from "react";
import {Network} from "../../../types/network";
import {useHistory, useLocation} from "react-router-dom";
import {GetParamValue} from "../../../utils/path";
import {GetNetworkRequest} from "../../../apis/network";
import "../../../string-extension";
import moment from "moment";
import DeviceList from "./deviceList";
import TopologyView from "./topologyView";
import {PlusOutlined} from "@ant-design/icons";
import AddDeviceModal from "./addDeviceModal";
import "../index.css";
import usePermission, {Permission} from "../../../permission/permission";
import HasPermission from "../../../permission";

const tabList = [
    {
        key: "devices",
        tab: "设备列表",
    },
    {
        key: "graph",
        tab: "拓扑图",
    },
]

const NetworkDetail = () => {
    const location = useLocation()
    const history = useHistory()
    const [network, setNetwork] = useState<Network>()
    const [addDeviceVisible, setAddDeviceVisible] = useState(false)
    const [currentKey, setCurrentKey] = useState<string>("devices");
    const [refreshKey, setRefreshKey] = useState(0)

    const onRefresh = () => {
        setRefreshKey(refreshKey + 1)
    }

    const contents = new Map<string, any>([
        ["devices", network && <DeviceList network={network} onRefresh={() => refreshKey}/>],
        ["graph", network && <TopologyView network={network}/>],
    ])

    useEffect(() => {
        const id = GetParamValue(location.search, "id")
        if (id) {
            GetNetworkRequest(Number(id)).then(data => {
                setNetwork(data)
            }).catch(_ => {
                history.goBack()
            })
        }
    }, [])

    const renderInformation = () => {
        if (network) {
            return <ShadowCard>
                <Typography.Title level={5}>网络信息</Typography.Title>
                <Row justify={"start"}>
                    <Col span={3} className="ts-detail-label">
                        网络名称
                    </Col>
                    <Col span={6}>
                        <Space>
                            {
                                network.name
                            }
                        </Space>
                    </Col>
                    <Col span={3} className="ts-detail-label">
                        所属资产
                    </Col>
                    <Col span={6}>
                        {
                            network.asset.name
                        }
                    </Col>
                </Row>
                <br/>
                <Row justify={"start"}>
                    <Col span={3} className="ts-detail-label">
                        通讯周期
                    </Col>
                    <Col span={6}>
                        <Space>
                            {
                                moment.duration(network.communicationPeriod / 1000, "seconds").humanize()
                            }
                        </Space>
                    </Col>
                    <Col span={3} className="ts-detail-label">
                        每组设备数
                    </Col>
                    <Col span={6}>
                        {
                            network.groupSize
                        }
                    </Col>
                </Row>
                <br/>
                <Row justify={"start"}>
                    <Col span={3} className="ts-detail-label">
                        通讯延时
                    </Col>
                    <Col span={6}>
                        <Space>
                            {
                                `${moment.duration(network.communicationTimeOffset / 1000, 'seconds').seconds()}秒`
                            }
                        </Space>
                    </Col>
                    <Col span={3} className="ts-detail-label">
                        每组通讯间隔
                    </Col>
                    <Col span={6}>
                        {
                            moment.duration(network.groupInterval / 1000, "seconds").humanize()
                        }
                    </Col>
                </Row>
                <br/>
                <Typography.Title level={5}>网关信息</Typography.Title>
                <Row justify={"start"}>
                    <Col span={3} className="ts-detail-label">
                        设备名称
                    </Col>
                    <Col span={6}>
                        <Space>
                            {
                                network.gateway.name
                            }
                        </Space>
                    </Col>
                    <Col span={3} className="ts-detail-label">
                        类型
                    </Col>
                    <Col span={6}>
                        网关
                    </Col>
                </Row>
                <br/>
                <Row justify={"start"}>
                    <Col span={3} className="ts-detail-label">
                        MAC地址
                    </Col>
                    <Col span={6}>
                        <Typography.Text copyable={{text: network.gateway.macAddress, tooltips: ["复制", "复制成功"]}}>
                            {
                                network.gateway.macAddress.toUpperCase().macSeparator()
                            }
                        </Typography.Text>
                    </Col>
                    <Col span={3} className="ts-detail-label">
                        型号
                    </Col>
                    <Col span={6}>
                        {
                            network.gateway.information.model ? network.gateway.information.model : "-"
                        }
                    </Col>
                </Row>
                <br/>
                <Row justify={"start"}>
                    <Col span={3} className="ts-detail-label">
                        固件版本号
                    </Col>
                    <Col span={6}>
                        {
                            network.gateway.information.firmware_version ? network.gateway.information.firmware_version : "-"
                        }
                    </Col>
                    <Col span={3} className="ts-detail-label">
                        固件编译时间
                    </Col>
                    <Col span={6}>
                        {
                            network.gateway.information.firmware_build_time ? moment(network.gateway.information.firmware_build_time).format("YYYY-MM-DD HH:mm:ss") : "-"
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
                            network.gateway.state.connectedAt ? moment(network.gateway.state.connectedAt * 1000).format("YYYY-MM-DD HH:mm:ss") : "-"
                        }
                    </Col>
                    <Col span={3} className="ts-detail-label">
                        硬件版本
                    </Col>
                    <Col span={6}>
                        {
                            network.gateway.information.product_id ? network.gateway.information.product_id : "-"
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
                            network.gateway.information.manufacturer ? network.gateway.information.manufacturer : "-"
                        }
                    </Col>
                    <Col span={3} className="ts-detail-label">
                        IP地址
                    </Col>
                    <Col span={6}>
                        {
                            network.gateway.information.ip_address ?
                                (<Space>{network.gateway.information.ip_address} <a
                                    href={`http://${network.gateway.information.ip_address}`}
                                    target={"_blank"}
                                    style={{fontSize: "10pt"}}>访问管理界面</a></Space>) :
                                "-"
                        }
                    </Col>
                </Row>
            </ShadowCard>
        }
    }

    return <Content>
        <MyBreadcrumb>
            <HasPermission value={Permission.NetworkAddDevices}>
                <Space>
                    <Button type={"primary"} onClick={() => setAddDeviceVisible(true)}>接入设备 <PlusOutlined/></Button>
                </Space>
            </HasPermission>
        </MyBreadcrumb>
        {
            renderInformation()
        }
        <br/>
        <ShadowCard size={"small"} tabList={tabList} onTabChange={key => {
            setCurrentKey(key)
        }}>
            {contents.get(currentKey)}
        </ShadowCard>
        {
            network &&
            <AddDeviceModal
                network={network}
                visible={addDeviceVisible}
                onCancel={() => setAddDeviceVisible(false)}
                onSuccess={() => {
                    onRefresh()
                    setAddDeviceVisible(false)
                }}
            />
        }
    </Content>
}

export default NetworkDetail