import {Button, Card, Col, Form, message, Result, Row, Space, Upload} from "antd";
import {Content} from "antd/lib/layout/layout";
import {useEffect, useState} from "react";
import {ImportOutlined, InboxOutlined} from "@ant-design/icons";
import {ImportNetworkRequest} from "../../../apis/network";
import ShadowCard from "../../../components/shadowCard";
import CommunicationTimeOffsetSelect from "../../../components/communicationTimeOffsetSelect";
import CommunicationPeriodSelect from "../../../components/communicationPeriodSelect";
import GroupSizeSelect from "../../../components/groupSizeSelect";
import GroupIntervalSelect from "../../../components/groupIntervalSelect";
import MyBreadcrumb from "../../../components/myBreadcrumb";
import G6 from "@antv/g6";
import "../../../components/shape/shape"
import {DeviceType} from "../../../types/device_type";
import network from "../index";

const {Dragger} = Upload

export interface NetworkRequestForm {
    wsn: {
        communication_period: number
        communication_time_offset: number
        group_size: number
        group_interval: number
    }
    devices: any
}

const ImportNetworkPage = () => {
    const [height] = useState<number>(window.innerHeight - 190)
    const [network, setNetwork] = useState<any>()
    const [success, setSuccess] = useState<boolean>(false)
    const [form] = Form.useForm()
    let graph: any = null

    const checkJSONFormat = (source: any) => {
        return source.hasOwnProperty("deviceList") && source.hasOwnProperty("wsn")
    }

    const onBeforeUpload = (file: any) => {
        const reader = new FileReader()
        reader.readAsText(file)
        reader.onload = () => {
            if (typeof reader.result === "string") {
                const json = JSON.parse(reader.result)
                console.log(json)
                if (checkJSONFormat(json)) {
                    setNetwork({wsn: json.wsn, devices: json.deviceList})
                } else {
                    message.error("文件格式错误").then()
                }
            }
        }
        return false
    }

    useEffect(() => {
        if (network) {
            form.setFieldsValue(
                {
                    communication_period: network.wsn.communication_period,
                    communication_time_offset: network.wsn.communication_time_offset,
                    group_size: network.wsn.group_size,
                    group_interval: network.wsn.group_interval
                })
        }
    }, [network])

    const onSave = () => {
        const nodes = network.devices
        if (nodes && nodes.length) {
            form.validateFields().then(values => {
                const req: NetworkRequestForm = {
                    wsn: {
                        communication_period: values.communication_period,
                        communication_time_offset: values.communication_time_offset,
                        group_size: values.group_size,
                        group_interval: values.group_interval,
                    },
                    devices: nodes.map((n: any) => {
                        return {
                            name: n.name,
                            mac_address: n.address,
                            parent_address: n.parentAddress,
                            type_id: n.type,
                            settings: n.settings,
                        }
                    })
                }
                ImportNetworkRequest(req).then(_ => setSuccess(true))
            })
        } else {
            message.error("不能导入空网络").then()
        }
    }

    const tree: any = (root: any) => {
        return network.devices.slice(1).filter((node:any) => node.parentAddress === root.address).map((item:any) => {
            return {
                id: item.address,
                data: item,
                children: tree(item)
            }
        });
    }

    useEffect(() => {
        if (network?.devices && network?.devices.length) {
            if (!graph){
                graph = new G6.TreeGraph({
                    container: 'container',
                    width: document.querySelector("#container")?.clientWidth,
                    height: document.querySelector("#container")?.clientHeight,
                    modes: {
                        default: [{type: 'collapse-expand'}, 'drag-canvas', 'zoom-canvas']
                    },
                    defaultNode: {
                        type: 'gateway',
                        size: [120, 40],
                        anchorPoints: [[0, 0.5], [1, 0.5]]
                    },
                    defaultEdge: {
                        type: 'cubic-horizontal',
                        style: {
                            stroke: '#A3B1BF',
                        }
                    },
                    layout: {
                        type: 'compactBox',
                        direction: 'LR',
                        getId: function getId(d: any) {
                            return d.id;
                        },
                        getHeight: function getHeight() {
                            return 16;
                        },
                        getWidth: function getWidth() {
                            return 16;
                        },
                        getVGap: function getVGap() {
                            return 20;
                        },
                        getHGap: function getHGap() {
                            return 80;
                        }
                    }
                });
                graph.data({
                    id: network.devices[0].macAddress,
                    data: network.devices[0],
                    children: tree(network.devices[0])
                });
                graph.render();
                graph.fitView();
            }
        }
    }, [network])

    const renderAction = () => {
        if (network) {
            return <a onClick={() => {
                setNetwork(undefined);
                form.resetFields();
            }}>重置</a>
        }
        return <div/>
    }

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
                                <Card type="inner" size={"small"} title={"预览"} style={{height: `${height}px`}} extra={renderAction()}>
                                    <div className="graph" style={{height: `${height - 56}px`, width: "100%"}}>
                                        {
                                            network?.devices.length ?
                                                <div id={"container"} style={{width: "100%", height: "100%"}}/>:
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
                                    setNetwork({devices: [], wsn: {}})
                                    setSuccess(false)
                                }}>继续导入网络</Button>,
                            ]}
                        />
                }
            </Form>
        </ShadowCard>
    </Content>
}

export default ImportNetworkPage