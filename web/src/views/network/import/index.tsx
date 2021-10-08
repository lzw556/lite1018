import {Button, Card, Col, Divider, Form, Input, message, Result, Row, Select, Space, Upload} from "antd";
import {Content} from "antd/lib/layout/layout";
import {useEffect, useState} from "react";
import {Canvas, Edge, Node, NodeProps, Remove} from "reaflow";
import "../graph/graph.css"
import {ImportOutlined, InboxOutlined, LeftOutlined, RightOutlined} from "@ant-design/icons";
import {COMMUNICATION_PERIOD, COMMUNICATION_TIME_OFFSET} from "../../../constants";
import {DeviceType} from "../../../types/device_type";
import {ImportNetworkRequest} from "../../../apis/network";
import AssetSelect from "../../asset/select/assetSelect";
import * as _ from 'lodash'

const {Dragger} = Upload
const {Option} = Select

export interface NetworkRequestForm {
    asset_id: number
    communication_period: number
    communication_time_offset: number
    routing_tables: [],
    devices: any
}

const ImportNetworkPage = () => {
    const [height] = useState<number>(window.innerHeight - 190)
    const [edges, setEdges] = useState<any>([])
    const [nodes, setNodes] = useState<any>([])
    const [current, setCurrent] = useState<number>(0)
    const [success, setSuccess] = useState<boolean>(false)
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

    const onNext = () => {
        setCurrent(current + 1)
    }

    const onPrevious = () => {
        setCurrent(current - 1)
    }

    const onSave = () => {
        form.validateFields().then(values => {
            const req: NetworkRequestForm = {
                asset_id: values.asset,
                communication_period: values.communication_period,
                communication_time_offset: values.communication_time_offset,
                routing_tables: edges.map((e: any) => [e.to, e.from]),
                devices: nodes.map((n: any) => {
                    return {
                        name: n.data.name,
                        mac_address: n.data.address,
                        type_id: n.data.type,
                        ...
                            JSON.parse(n.data.settings)
                    }
                })
            }
            ImportNetworkRequest(req).then(res => {
                if (res.code === 200) {
                    setSuccess(true)
                }else {
                    message.error(`导入失败,${res.msg}`).then()
                }
            })
        })
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
        return <Space>
            {
                current > 0 && <Button type="link" onClick={onPrevious}><LeftOutlined /></Button>
            }
            {
                current < nodes.length - 1 && <Button type="link" onClick={onNext}><RightOutlined/></Button>
            }
        </Space>
    }

    useEffect(() => {
        if (nodes[current]) {
            form.setFieldsValue({
                name: nodes[current].data.name,
                mac_address: nodes[current].data.address
            })
        }
    }, [nodes[current]])

    return <div>
        <Row justify="center">
            <Col span={24} style={{textAlign: "right"}}>
                <Space>
                    {
                        !success && (<Button type="primary" onClick={onSave}>保存网络<ImportOutlined/></Button>)
                    }
                </Space>
            </Col>
        </Row>
        <Content style={{paddingTop: "15px"}}>
            <Card>
                <Form form={form} labelCol={{span: 6}}>
                {
                    !success ?
                        <Row justify="space-between">
                            <Col span={16}>
                                <Card type="inner" size={"small"} title={"预览"} style={{height: `${height}px`}}
                                      extra={renderActionButton()}>
                                    <div className="graph" style={{height: `${height - 56}px`}}>
                                        {
                                            nodes.length ?
                                                <Canvas selections={nodes[current] ? [nodes[current].data.address] : []}
                                                        nodes={nodes} edges={edges}
                                                        direction="DOWN"
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
                                                            <Edge remove={<Remove hidden={true}/>}/>
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
                            <Col span={8} style={{paddingLeft: "4px"}}>
                                <Card type="inner" size={"small"} title={"编辑"} style={{height: `${height}px`}}>
                                        <Divider orientation={"left"} plain>基本信息</Divider>
                                        <Form.Item label={"所属资产"} name="asset"
                                                   rules={[{required: true, message: "请选择网络所属资产"}]}>
                                            <AssetSelect defaultActiveFirstOption={false} placeholder={"请选择网络所属资产"}/>
                                        </Form.Item>
                                        <Divider orientation={"left"} plain>网络配置信息</Divider>
                                        <Form.Item label="通讯周期" name="communication_period">
                                            <Select placeholder={"请选择网络通讯周期"}>
                                                {
                                                    COMMUNICATION_PERIOD.map(item =>
                                                        <Option key={item.value} value={item.value}>{item.text}</Option>
                                                    )
                                                }
                                            </Select>
                                        </Form.Item>
                                        <Form.Item label="通讯延时" name="communication_time_offset">
                                            <Select placeholder={"请选择网络通讯延时"}>
                                                {
                                                    COMMUNICATION_TIME_OFFSET.map(item =>
                                                        <Option key={item.value} value={item.value}>{item.text}</Option>
                                                    )
                                                }
                                            </Select>
                                        </Form.Item>
                                        <Divider orientation={"left"} plain>设备基本信息</Divider>
                                        <Form.Item label="名称" name="name">
                                            <Input placeholder={"请输入设备名称"} onChange={(e) => {
                                                const newNodes = _.cloneDeep(nodes)
                                                const node = nodes[current]
                                                node.text = e.target.value
                                                node.data.name = e.target.value
                                                newNodes[current] = node
                                                setNodes(newNodes)
                                            }}/>
                                        </Form.Item>
                                        <Form.Item label={"MAC地址"} name="mac_address">
                                            <Input placeholder={"请输入设备MAC地址"} onChange={(e) => {
                                                const newNodes = _.cloneDeep(nodes)
                                                const node = nodes[current]
                                                node.data.address = e.target.value
                                                newNodes[current] = node
                                                setNodes(newNodes)
                                            }}/>
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
                                    window.location.hash = "network-management/networks"
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
            </Card>
        </Content>
    </div>
}

export default ImportNetworkPage