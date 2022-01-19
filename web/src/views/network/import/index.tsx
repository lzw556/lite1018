import {Button, Card, Col, Form, message, Result, Row, Space, Upload} from "antd";
import {Content} from "antd/lib/layout/layout";
import {useEffect, useState} from "react";
import {Canvas, Edge, Node, NodeProps, Remove} from "reaflow";
import {ImportOutlined, InboxOutlined} from "@ant-design/icons";
import {DeviceType} from "../../../types/device_type";
import {ImportNetworkRequest} from "../../../apis/network";
import ShadowCard from "../../../components/shadowCard";
import AddNodeModal from "../modal/addNode";
import CommunicationTimeOffsetSelect from "../../../components/communicationTimeOffsetSelect";
import CommunicationPeriodSelect from "../../../components/communicationPeriodSelect";
import GroupSizeSelect from "../../../components/groupSizeSelect";
import GroupIntervalSelect from "../../../components/groupIntervalSelect";
import MyBreadcrumb from "../../../components/myBreadcrumb";

const {Dragger} = Upload

export interface NetworkRequestForm {
    asset_id: number
    communication_period: number
    communication_time_offset: number
    group_size: number
    group_interval: number
    routing_tables: [],
    devices: any
}

const ImportNetworkPage = () => {
    const [height] = useState<number>(window.innerHeight - 190)
    const [edges, setEdges] = useState<any>([])
    const [nodes, setNodes] = useState<any>([])
    const [current, setCurrent] = useState<number>(0)
    const [success, setSuccess] = useState<boolean>(false)
    const [addNodeVisible, setAddNodeVisible] = useState<boolean>(false)
    const [form] = Form.useForm()

    const checkJSONFormat = (source: any) => {
        return source.hasOwnProperty("deviceList") && source.hasOwnProperty("settings") && source.hasOwnProperty("routingTable")
    }

    const onBeforeUpload = (file: any) => {
        const reader = new FileReader()
        reader.readAsText(file)
        reader.onload = () => {
            if (typeof reader.result === "string") {
                const json = JSON.parse(reader.result)
                if (checkJSONFormat(json)) {
                    const devices = json.deviceList
                    if (devices && devices.length) {
                        if (devices.reduce((acc: Map<string, any>, item: any) => acc.set(item.address, item), new Map()).size === devices.length) {
                            setNodes(devices.map((item: any) => {
                                return {id: item.address, text: item.name, data: item}
                            }))
                            setEdges(json.routingTable.map((item: any) => {
                                return {id: `${item[0]}`, from: item[1], to: item[0]}
                            }))
                            const wsn = json.settings.wsn
                            form.setFieldsValue(
                                {
                                    communication_period: wsn.communication_period,
                                    communication_time_offset: wsn.communication_time_offset,
                                    group_size: wsn.group_size,
                                    group_interval: wsn.group_interval
                                })
                        } else {
                            message.error("设备MAC地址重复").then()
                        }
                    }
                } else {
                    message.error("文件格式错误").then()
                }
            }
        }
        return false
    }

    const onSave = () => {
        if (nodes && nodes.length) {
            form.validateFields().then(values => {
                const req: NetworkRequestForm = {
                    asset_id: values.asset,
                    communication_period: values.communication_period,
                    communication_time_offset: values.communication_time_offset,
                    group_size: values.group_size,
                    group_interval: values.group_interval,
                    routing_tables: edges.map((e: any) => [e.to, e.from]),
                    devices: nodes.map((n: any) => {
                        return {
                            name: n.data.name,
                            mac_address: n.data.address,
                            type_id: n.data.type,
                            ...JSON.parse(n.data.settings)
                        }
                    })
                }
                ImportNetworkRequest(req).then(_ => setSuccess(true))
            })
        } else {
            message.error("不能导入空网络").then()
        }
    }

    const onRemove = (node: any) => {
        const newNodes = nodes.filter((n: any) => n.id !== node.id)
        const newEdges = edges.filter((e: any) => e.from !== node.id && e.to !== node.id)
        const parents = edges.filter((e: any) => e.to === node.id)
        const children = edges.filter((e: any) => e.from === node.id)
        parents.forEach((parent: any) => {
            children.forEach((child: any) => {
                const parentNode = nodes.find((n: any) => n.id === parent.from)
                const childNode = nodes.find((n: any) => n.id === child.to)
                if (parentNode && childNode) {
                    newEdges.push({id: childNode.id, from: parentNode.id, to: childNode.id})
                }
            })
        })
        setNodes(newNodes)
        setEdges(newEdges)
        setCurrent(0)
    }

    const renderActionButton = () => {
        if (nodes && nodes.length) {
            return <Space>
                <a onClick={() => setAddNodeVisible(true)}>添加设备</a>
            </Space>
        }
    }

    useEffect(() => {
        if (nodes[current]) {
            form.setFieldsValue({
                name: nodes[current].data.name,
                mac_address: nodes[current].data.address
            })
        }
    }, [current])

    return <Content>
        <MyBreadcrumb>
            <Space>
                {
                    !success && (<Button type="primary" onClick={onSave}>保存网络<ImportOutlined/></Button>)
                }
            </Space>
        </MyBreadcrumb>
        <ShadowCard>
            <Form form={form} labelCol={{span: 8}}>
                {
                    !success ?
                        <Row justify="space-between">
                            <Col xl={16} xxl={18}>
                                <Card type="inner" size={"small"} title={"预览"} style={{height: `${height}px`}}
                                      extra={renderActionButton()}>
                                    <div className="graph" style={{height: `${height - 56}px`}}>
                                        {
                                            nodes.length ?
                                                <Canvas
                                                    selections={nodes[current] ? [nodes[current].data.address] : []}
                                                    nodes={nodes} edges={edges}
                                                    direction="DOWN"
                                                    onNodeLink={(event, from, to) => {
                                                        setEdges([
                                                            ...edges,
                                                            {
                                                                id: to.id,
                                                                from: from.id,
                                                                to: to.id
                                                            }
                                                        ])
                                                    }}
                                                    node={(props: NodeProps) => (
                                                        <Node
                                                            onClick={(event, node) => {
                                                                const index = nodes.map((item: any) => item.id).indexOf(node.id)
                                                                setCurrent(index)
                                                            }}
                                                            remove={<Remove
                                                                hidden={props.properties.data.type === DeviceType.Gateway}/>}
                                                            onRemove={(event, node) => {
                                                                onRemove(node)
                                                            }}
                                                        />
                                                    )}
                                                    edge={
                                                        <Edge onRemove={(event, edge) => {
                                                            const newEdges = edges.filter((item: any) => item.id !== edge.id)
                                                            setEdges(newEdges)
                                                            console.log(edge)
                                                        }}/>
                                                    }
                                                /> :
                                                <Dragger accept={".json"} beforeUpload={onBeforeUpload}
                                                         showUploadList={false}>
                                                    <p className="ant-upload-drag-icon">
                                                        <InboxOutlined/>
                                                    </p>
                                                    <p className="ant-upload-text">点击或拖动网络模板文件到此区域</p>
                                                    <p className="ant-upload-hint">
                                                        请选择以.json结尾的文件,只支持单个网络模板文件的上传
                                                    </p>
                                                </Dragger>
                                        }
                                    </div>
                                </Card>
                            </Col>
                            <Col xl={8} xxl={6} style={{paddingLeft: "4px"}}>
                                <Card type="inner" size={"small"} title={"编辑"} style={{height: `${height}px`}}>
                                    <Form.Item label="通讯周期" name="communication_period"
                                               rules={[{required: true, message: "请选择网络通讯周期"}]}>
                                        <CommunicationPeriodSelect placeholder={"请选择网络通讯周期"}/>
                                    </Form.Item>
                                    <Form.Item label="通讯延时" name="communication_time_offset"
                                               rules={[{required: true}]}>
                                        <CommunicationTimeOffsetSelect placeholder={"请选择网络通讯延时"}/>
                                    </Form.Item>
                                    <Form.Item label="每组设备数" name="group_size" initialValue={4}
                                               rules={[{required: true}]}>
                                        <GroupSizeSelect placeholder={"请选择每组设备数"}/>
                                    </Form.Item>
                                    <Form.Item label="每组通信间隔" name="group_interval" rules={[{required: true}]}>
                                        <GroupIntervalSelect placeholder={"请选择通信间隔"}/>
                                    </Form.Item>
                                    <br/>
                                </Card>
                            </Col>
                        </Row> :
                        <Result
                            status="success"
                            title="网络导入成功"
                            subTitle="您可以返回网络列表查看网络信息或者继续导入网络"
                            extra={[
                                <Button type="primary" key="devices" onClick={() => {
                                    window.location.hash = "network-management?locale=networks"
                                }}>
                                    返回网络列表
                                </Button>,
                                <Button key="add" onClick={() => {
                                    form.resetFields()
                                    setNodes([])
                                    setEdges([])
                                    setCurrent(0)
                                    setSuccess(false)
                                }}>继续导入网络</Button>,
                            ]}
                        />
                }
            </Form>
        </ShadowCard>
        <AddNodeModal visible={addNodeVisible} onCancel={() => setAddNodeVisible(false)} onSuccess={node => {
            setNodes([
                ...nodes,
                node
            ])
            setAddNodeVisible(false)
        }}/>
    </Content>
}

export default ImportNetworkPage