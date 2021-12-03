import {Button, Card, Col, Dropdown, Form, Input, Menu, message, Modal, Row, Select, Space, Tooltip} from "antd";
import {Content} from "antd/lib/layout/layout";
import {useState} from "react";
import {
    DeleteNetworkRequest,
    ExportNetworkRequest,
    GetNetworkRequest,
    RemoveDevicesRequest,
    SyncNetworkRequest,
    UpdateNetworkRequest
} from "../../apis/network";
import {Network} from "../../types/network";
import {Device} from "../../types/device";
import Graph from "./graph/graph";
import {QuestionCircleOutlined, UnorderedListOutlined} from "@ant-design/icons";
import AccessDeviceModal from "./modal/accessDevice";
import Label from "../../components/label";
import ShadowCard from "../../components/shadowCard";
import "./index.css"
import {COMMUNICATION_PERIOD, COMMUNICATION_TIME_OFFSET, GROUP_INTERVAL} from "../../constants";
import CommunicationPeriodSelect from "../../components/communicationPeriodSelect";
import CommunicationTimeOffsetSelect from "../../components/communicationTimeOffsetSelect";
import GroupSizeSelect from "../../components/groupSizeSelect";
import GroupIntervalSelect from "../../components/groupIntervalSelect";
import AssetSelect from "../../components/assetSelect";
import NetworkSelect from "../../components/networkSelect";
import {SendDeviceCommandRequest} from "../../apis/device";
import {DeviceCommand} from "../../types/device_command";
import {EmptyLayout} from "../layout";
import useSocket from "../../socket";
import MyBreadcrumb from "../../components/myBreadcrumb";
import HasPermission from "../../permission";
import userPermission, {Permission} from "../../permission/permission";

export interface DevicePopover {
    device: Device
    x: number
    y: number
    visible: boolean
}

const {Option} = Select

const NetworkPage = () => {
    const [assetId, setAssetId] = useState<number>(0)
    const [network, setNetwork] = useState<Network>()
    const [height] = useState<number>(window.innerHeight - 220)
    const [device] = useState<Device>()
    const [accessVisible, setAccessVisible] = useState<boolean>(false)
    const [isEdit, setIsEdit] = useState<boolean>(false)
    const [isNetworkEdit, setIsNetworkEdit] = useState<boolean>(false)
    const [removeNode, setRemoveNode] = useState<number[]>([])
    const [routingTables, setRoutingTables] = useState<any>()
    const [form] = Form.useForm()
    const {PubSub} = useSocket()
    const {hasPermission} = userPermission()

    // useEffect(() => {
    //     PubSub.subscribe(SocketTopic.connectionState, (msg: string, state: any) => {
    //         if (state && network) {
    //             const newNetwork = _.cloneDeep(network)
    //             newNetwork.nodes = newNetwork.nodes.map(item => {
    //                 if (item.id === state.id) {
    //                     item.state.isOnline = state.isOnline
    //                     item.state.connectAt = state.connectAt
    //                 }
    //                 return item
    //             })
    //             setNetwork(newNetwork)
    //         }
    //     })
    // }, [network])

    const fetchNetwork = (id: number) => {
        GetNetworkRequest(id).then(data => {
            setNetwork(data)
            setIsNetworkEdit(false)
            setIsEdit(false)
        })
    }

    const onAssetChange = (value: number) => {
        setAssetId(value)
    }

    const onAccessDeviceSuccess = (id: number) => {
        fetchNetwork(id)
        setAccessVisible(false)
    }

    const onMenuClick = (n: Network, key: any) => {
        switch (key) {
            case "1":
                setAccessVisible(true)
                break
            case "2":
                ExportNetworkRequest(n.id).then(res => {
                    const url = window.URL.createObjectURL(new Blob([res.data]))
                    const link = document.createElement('a')
                    link.href = url
                    link.setAttribute('download', `${n.name}.json`)
                    document.body.appendChild(link)
                    link.click()
                })
                break
            case "3":
                SendDeviceCommandRequest(n.gateway.id, DeviceCommand.Provision).then(res => {
                    if (res.code === 200) {
                        message.success("命令发送成功").then()
                    } else {
                        message.error("命令发送失败").then()
                    }
                })
                break
            case "4":
                SyncNetworkRequest(n.id).then(res => {
                    if (res.code === 200) {
                        message.success("网络同步成功").then()
                    } else {
                        message.error("网络同步失败").then()
                    }
                })
                break
            case "5":
                Modal.confirm({
                    title: "删除网络提示",
                    content: `确认要删除【${n.name}】网络以及下面所有设备吗？`,
                    okText: "确认",
                    cancelText: "取消",
                    onOk: (close) => {
                        DeleteNetworkRequest(n.id).then(_ => {
                            close()
                            window.location.reload()
                        })
                    }
                })
                break
        }
    }

    const onSaveNetwork = () => {
        if (network && removeNode && removeNode.length) {
            RemoveDevicesRequest(network.id, {device_ids: removeNode, routing_tables: routingTables}).then(_ => {
                fetchNetwork(network.id)
            })
        } else {
            setIsNetworkEdit(!isNetworkEdit)
        }
    }

    const renderMoreAction = () => {
        if (network) {
            const isOnline = network.gateway.state?.isOnline
            return <Menu onClick={(e) => {
                onMenuClick(network, e.key)
            }}>
                {
                    hasPermission(Permission.NetworkAccessDevices) &&
                    <Menu.Item key={1}>接入设备</Menu.Item>
                }
                {
                    hasPermission(Permission.NetworkExport) &&
                    <Menu.Item key={2}>导出网络</Menu.Item>
                }
                {
                    hasPermission(Permission.DeviceCommand) &&
                    (<>
                        <Menu.Item key={3} disabled={!isOnline}>继续组网</Menu.Item>
                        <Menu.Item key={4} disabled={!isOnline}>同步网络</Menu.Item>
                    </>)
                }
                {
                    hasPermission(Permission.NetworkDelete) &&
                    <Menu.Item key={5}>删除网络</Menu.Item>
                }
            </Menu>
        }
        return <div/>
    }

    const renderActionButton = () => {
        if (network) {
            return <Space>
                <HasPermission value={Permission.NetworkRemoveDevices}>
                    <Button size={"small"} type={"link"} hidden={isNetworkEdit}
                            onClick={() => setIsNetworkEdit(!isNetworkEdit)}>编辑</Button>
                    <Button size={"small"} type={"link"} hidden={!isNetworkEdit} onClick={onSaveNetwork}>保存</Button>
                    <Button size={"small"} type={"link"} hidden={!isNetworkEdit}
                            onClick={() => setIsNetworkEdit(!isNetworkEdit)}>取消</Button>
                </HasPermission>
                <Dropdown overlay={renderMoreAction}>
                    <Button size={"small"} type={"text"} icon={<UnorderedListOutlined/>}/>
                </Dropdown>
            </Space>
        }
    }

    const onSave = () => {
        form.validateFields().then(values => {
            if (network) {
                UpdateNetworkRequest(network.id, values).then(res => {
                    if (res.code === 200) {
                        message.success("保存成功").then()
                        setNetwork(Object.assign({}, network, {
                            name: res.data.name,
                            communicationPeriod: res.data.communicationPeriod,
                            communicationTimeOffset: res.data.communicationTimeOffset,
                            groupSize: res.data.groupSize,
                            groupInterval: res.data.groupInterval,
                        }))
                        setIsEdit(!isEdit)
                    } else {
                        message.error("保存失败").then()
                    }
                })
            }
        })
    }

    const renderEditButton = () => {
        if (network) {
            return <Space>
                <HasPermission value={Permission.NetworkEdit}>
                    <Button size={"small"} type={"link"} hidden={!isEdit} onClick={onSave}>保存</Button>
                    <Button size={"small"} type={"link"} hidden={!isEdit} onClick={() => setIsEdit(!isEdit)}>取消</Button>
                    <Button size={"small"} type={"link"} hidden={isEdit} onClick={() => setIsEdit(!isEdit)}>编辑</Button>
                </HasPermission>
            </Space>
        }
    }

    const renderBasicInfo = () => {
        if (network) {
            const period = COMMUNICATION_PERIOD.find(item => item.value === network.communicationPeriod)
            const offset = COMMUNICATION_TIME_OFFSET.find(item => item.value === network.communicationTimeOffset)
            const interval = GROUP_INTERVAL.find(item => item.value === network.groupInterval)
            return <Form form={form}>
                <Row justify={"start"}>
                    <Col span={8} className={"ts-detail-label"}>
                        网络名称
                    </Col>
                    <Col span={10} offset={2}>
                        <Form.Item name={"name"} initialValue={network.name} noStyle>
                            {
                                isEdit ? <Input style={{width: "128px"}} size={"small"}/> : network.name
                            }
                        </Form.Item>
                    </Col>
                </Row>
                <br/>
                <Row justify={"start"}>
                    <Col span={8} className={"ts-detail-label"}>
                        <Space>
                            通讯周期
                            <Tooltip placement="top" title={"指网关与服务器的通讯周期"}>
                                <QuestionCircleOutlined/>
                            </Tooltip>
                        </Space>
                    </Col>
                    <Col span={10} offset={2}>
                        <Form.Item name={"communication_period"} initialValue={network.communicationPeriod} noStyle>
                            {
                                isEdit ?
                                    <CommunicationPeriodSelect style={{width: "128px"}} size={"small"}
                                                               placeholder={"请选择网络通讯周期"}/> :
                                    period ? period.text : `${network.communicationPeriod / 1000}秒`
                            }
                        </Form.Item>
                    </Col>
                </Row>
                <br/>
                <Row justify={"start"}>
                    <Col span={8} className={"ts-detail-label"}>
                        通讯延时
                    </Col>
                    <Col span={10} offset={2}>
                        <Form.Item name={"communication_time_offset"} initialValue={network.communicationTimeOffset}
                                   noStyle>
                            {
                                isEdit ? <CommunicationTimeOffsetSelect style={{width: "128px"}} size={"small"}
                                                                        placeholder={"请选择网络通讯延时"}/> :
                                    offset ? offset.text : `${network.communicationTimeOffset / 1000}秒`
                            }
                        </Form.Item>
                    </Col>
                </Row>
                <br/>
                <Row justify={"start"}>
                    <Col span={8} className={"ts-detail-label"}>
                        每组设备数
                    </Col>
                    <Col span={10} offset={2}>
                        <Form.Item name={"group_size"} initialValue={network.groupSize} noStyle>
                            {
                                isEdit ? <GroupSizeSelect style={{width: "128px"}} size={"small"}
                                                          placeholder={"请选择网络每组设备数"}/> : network.groupSize
                            }
                        </Form.Item>
                    </Col>
                </Row>
                <br/>
                <Row justify={"start"}>
                    <Col span={8} className={"ts-detail-label"}>
                        每组通信间隔
                    </Col>
                    <Col span={10} offset={2}>
                        <Form.Item name={"group_interval"} initialValue={network.groupInterval} noStyle>
                            {
                                isEdit ? <GroupIntervalSelect style={{width: "128px"}} size={"small"}
                                                              placeholder={"请选择网络每组通信间隔"}/> : interval ? interval.text : `${network.groupInterval / 1000}秒`
                            }
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        }
    }

    const renderNetworkGraph = () => {
        if (network) {
            return <Graph height={height}
                          isEdit={isNetworkEdit}
                          network={network}
                          onNodeRemove={(value, tables) => {
                              setRemoveNode([...removeNode, value])
                              setRoutingTables(tables)
                          }}/>
        }
        return <EmptyLayout description={"暂无网络"}/>
    }

    return <Content>
        <MyBreadcrumb/>
        <Row justify="center">
            <Col span={24}>
                <ShadowCard>
                    <Row justify="center">
                        <Col span={24}>
                            <Space>
                                <Label name={"资产"}>
                                    <AssetSelect bordered={false} style={{width: "150px"}} defaultValue={assetId}
                                                 defaultActiveFirstOption={true}
                                                 placeholder={"请选择资产"}
                                                 onChange={onAssetChange}>
                                        <Option key={0} value={0}>所有资产</Option>
                                    </AssetSelect>
                                </Label>
                                <Label name={"网络"}>
                                    <NetworkSelect value={network?.id} bordered={false}
                                                   defaultActiveFirstOption={true} style={{width: "150px"}}
                                                   placeholder={"暂无网络"} asset={assetId} onChange={value => {
                                        value ? fetchNetwork(value) : setNetwork(undefined)
                                    }} onDefaultSelect={value => {
                                        value ? fetchNetwork(value) : setNetwork(undefined)
                                    }}/>
                                </Label>
                            </Space>
                        </Col>
                    </Row>
                    <br/>
                    <Row justify="space-between" style={{height: `${height}px`}}>
                        <Col span={17} style={{paddingRight: "4px", height: "100%"}}>
                            <Card type="inner" size={"small"} title={"拓扑图"} style={{height: "100%"}}
                                  extra={renderActionButton()}>
                                {
                                    renderNetworkGraph()
                                }
                            </Card>
                        </Col>
                        <Col span={7} style={{height: "100%"}}>
                            <Card type={"inner"} title={"基本信息"} size={"small"}
                                  style={{height: "100%"}} extra={renderEditButton()}>
                                {
                                    renderBasicInfo()
                                }
                            </Card>
                        </Col>
                    </Row>
                </ShadowCard>
            </Col>
        </Row>
        <AccessDeviceModal parent={device}
                           assetId={assetId}
                           networkId={network ? network.id : 0}
                           visible={accessVisible}
                           onCancel={() => {
                               setAccessVisible(false)
                           }} onSuccess={onAccessDeviceSuccess}/>
    </Content>
}

export default NetworkPage