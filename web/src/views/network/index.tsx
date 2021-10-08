import {Button, Card, Col, message, Modal, Row, Space, Tree, TreeDataNode} from "antd";
import {Content} from "antd/lib/layout/layout";
import AssetSelect from "../asset/select/assetSelect";
import {useCallback, useEffect, useState} from "react";
import {ExportNetworkRequest, GetNetworkRequest, GetNetworksRequest, RemoveDeviceRequest} from "../../apis/network";
import {Network} from "../../types/network";
import {Device} from "../../types/device";
import Graph from "./graph/graph";
import {CaretDownOutlined, ClusterOutlined, ExclamationCircleOutlined} from "@ant-design/icons";
import AccessDeviceModal from "./modal/accessDevice";
import Label from "../../components/label";

interface NetworkTreeNode extends TreeDataNode {
    network: Network
}

export interface DevicePopover {
    device: Device
    x: number
    y: number
    visible: boolean
}

const NetworkPage = () => {
    const [assetId, setAssetId] = useState<number>(0)
    const [networks, setNetworks] = useState<NetworkTreeNode[]>([])
    const [network, setNetwork] = useState<Network>()
    const [height, setHeight] = useState<number>(window.innerHeight - 220)
    const [device, setDevice] = useState<Device>()
    const [accessVisible, setAccessVisible] = useState<boolean>(false)
    const [modal, contextHolder] = Modal.useModal()

    const loadNetworks = useCallback(() => {
        GetNetworksRequest(assetId).then(res => {
            if (res.code === 200) {
                setNetworks(res.data.map(item => {
                    return {key: item.id, title: item.name, icon: <ClusterOutlined/>, network: item}
                }))
            }
        })
    }, [assetId])

    const fetchNetwork = (id: number) => {
        GetNetworkRequest(id).then(res => {
            if (res.code === 200) {
                setNetwork(res.data)
            }
        })
    }

    const onAssetChange = (value: number) => {
        setAssetId(value)
    }

    const onClickNode = (device: Device) => {
        setDevice(device)
    }

    const onHoverNode = (x: number, y: number, device: Device) => {
    }

    const onLeaveNode = () => {
    }

    const onRemoveNode = (device: Device) => {
        modal.confirm({
            title: "请注意",
            icon: <ExclamationCircleOutlined/>,
            content: <p>此操作并不会删除设备，只是将设备从该网络中移除</p>,
            okText: "确定",
            onOk() {
                if (network) {
                    RemoveDeviceRequest(network.id, device.id).then(res => {
                        if (res.code === 200) {
                            message.success("移除成功").then()
                            setNetwork(res.data)
                        } else {
                            message.error(`移除失败,${res.msg}`).then()
                        }
                    })
                }
            },
            cancelText: "取消",
            onCancel() {

            }
        })
    }

    const onAccessDeviceSuccess = (id: number) => {
        fetchNetwork(id)
        setAccessVisible(false)
    }

    const renderActionButton = () => {
        if (network) {
            return <Space>
                <Button type="link" size="small" onClick={() => setAccessVisible(true)}>
                    接入设备
                </Button>
                <Button type="link" size="small" onClick={() => {
                    ExportNetworkRequest(network.id).then(res => {
                        const url = window.URL.createObjectURL(new Blob([res.data]))
                        const link = document.createElement('a')
                        link.href = url
                        link.setAttribute('download', `${network.name}.json`)
                        document.body.appendChild(link)
                        link.click()
                    })
                }}>
                    导出网络
                </Button>
            </Space>
        }
    }

    const loadGraphData = () => {
        if (network) {
            const nodes = network.nodes.map(item => {
                return {id: item.macAddress, text: item.name, data: {device: item}}
            })
            const edges = network.routingTables.map(item => {
                return {from: item[1], to: item[0], id: ""}
            })
            return {nodes: nodes, edges: edges}
        }
        return {nodes: [], edges: []}
    }

    const resizeListener = (e: any) => {
        setHeight(e.target.innerHeight - 220)
    }

    useEffect(() => {
        loadNetworks()
        window.addEventListener("resize", resizeListener)
        return window.removeEventListener("resize", resizeListener)
    }, [loadNetworks])

    return <div>
        <Row justify="center">
            <Col span={24} style={{textAlign: "right"}}>
            </Col>
        </Row>
        <Row justify="center">
            <Col span={24}>
                <Content style={{paddingTop: "35px"}}>
                    <Card>
                        <Row justify="center">
                            <Col span={24}>
                                <Space>
                                    <Label name={"资产"}>
                                        <AssetSelect bordered={false} style={{width: "150px"}} defaultValue={assetId}
                                                     defaultActiveFirstOption={true}
                                                     defaultOption={{value: 0, text: "所有资产"}} placeholder={"请选择资产"}
                                                     onChange={onAssetChange} suffixIcon={<CaretDownOutlined />}/>
                                    </Label>
                                </Space>
                            </Col>
                        </Row>
                        <br/>
                        <Row justify="space-between" style={{height: `${height}px`}}>
                            <Col span={4} style={{height: "100%"}}>
                                <Card type={"inner"} title={"网络列表"} size={"small"}
                                      style={{height: "100%", backgroundColor: "#f4f5f6"}}>
                                    <Tree treeData={networks}
                                          showIcon={true}
                                          style={{height: "100%", backgroundColor: "#f4f5f6"}}
                                          onSelect={(selectedKeys) => {
                                              if (selectedKeys && selectedKeys.length) {
                                                  fetchNetwork(Number(selectedKeys[0]))
                                              }
                                          }}/>
                                </Card>
                            </Col>
                            <Col span={20} style={{paddingLeft: "4px", height: "100%"}}>
                                <Card type="inner" size={"small"} title={"拓扑图"} style={{height: "100%"}}
                                      extra={renderActionButton()}>
                                    <Graph selections={device ? [device.macAddress] : []} height={height}
                                           data={loadGraphData()}
                                           onClick={onClickNode}
                                           onRemove={onRemoveNode}
                                           onHover={onHoverNode}
                                           onLeave={onLeaveNode}
                                    />
                                </Card>
                            </Col>
                        </Row>
                    </Card>
                </Content>
            </Col>
        </Row>
        {contextHolder}
        <AccessDeviceModal parent={device}
                           assetId={assetId}
                           networkId={network ? network.id : 0}
                           visible={accessVisible}
                           onCancel={() => {
                               setAccessVisible(false)
                           }} onSuccess={onAccessDeviceSuccess}/>
    </div>
}

export default NetworkPage