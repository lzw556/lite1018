import {Button, Card, Col, Form, Input, message, Radio, Row, Select, Space, Table, Typography} from "antd";
import {Content} from "antd/lib/layout/layout";
import {useCallback, useEffect, useState} from "react";
import {useHistory} from "react-router-dom";
import {AddAlarmRuleRequest, CheckAlarmNameRequest, PagingAlarmTemplateRequest} from "../../../apis/alarm";
import MyBreadcrumb from "../../../components/myBreadcrumb";
import ShadowCard from "../../../components/shadowCard";
import SourceSelectModal from "./modal/sourceSelectModal";
import {DeleteOutlined} from "@ant-design/icons";
import {defaultValidateMessages, Normalizes, Rules} from "../../../constants/validator";

const {Option} = Select

const AddAlarmRule = () => {
    const [selectedTemplates, setSelectedTemplates] = useState<number[]>([])
    const [createType, setCreateType] = useState<number>(0)
    const [visible, setVisible] = useState<boolean>(false)
    const [selected, setSelected] = useState<any>()
    const [form] = Form.useForm()
    const history = useHistory()

    const fetchAlarmTemplates = useCallback((current: number, size: number) => {
    }, [])

    useEffect(() => {
        form.setFieldsValue({
            duration: 1,
            operation: ">=",
            level: 3,
        })
    }, [createType, fetchAlarmTemplates])


    const onSave = () => {
        form.validateFields().then(values => {
            values.source_ids = selected.sources.map((item:any) => item.id)
            values.source_type = selected.sourceType
            values.metric = selected.metric
            AddAlarmRuleRequest(values).then(data => {
                console.log(data);
            })
        }).catch(err => {
            message.error(err)
        })
    }

    const onNameValidator = (rule: any, value: any) => {
        return new Promise<void>((resolve, reject) => {
            if (!value) {
                reject("输入不能为空")
                return
            }
            CheckAlarmNameRequest(value).then(_ => resolve()).catch(_ => reject("该名称已存在"))
        })
    }

    const columns = [
        {
            title: '模板名称',
            dataIndex: 'name',
            key: 'name'
        }
    ]

    const rowSelection = {
        selectedTemplates,
        onChange: (selectedRowKeys: any) => {
            setSelectedTemplates(selectedRowKeys)
        }
    }

    const onRemoveSource = (id: any) => {
        setSelected(selected.sources.filter((item: any) => item.id !== id))
    }

    const sourceColumns = [
        {
            title: '资源名称',
            dataIndex: 'name',
            key: 'name',
            width: '40%',
        },
        {
            title: '指标名称',
            dataIndex: 'index',
            key: 'index',
            width: '40%',
            render: (text: any, record: any) => {
                return selected.metric.name
            }
        },
        {
            title: '操作',
            key: 'action',
            width: '20%',
            render: (text: any, record: any) => {
                return <Space>
                    <Button type="text" size="small" icon={<DeleteOutlined/>} danger
                            onClick={() => onRemoveSource(record.id)}/>
                </Space>
            }
        }
    ]

    return <Content>
        <MyBreadcrumb/>
        <Form form={form} validateMessages={defaultValidateMessages}>
            <ShadowCard>
                <Row justify={"space-between"}>
                    <Col span={24}>
                        <Form.Item label={"规则名称"} labelCol={{span: 2}} wrapperCol={{span: 8}} name={"name"} required>
                            <Input placeholder={"请输入规则名称"}/>
                        </Form.Item>
                    </Col>
                </Row>
                <Row justify={"space-between"}>
                    <Col span={24}>
                        <Form.Item label={"规则描述"} labelCol={{span: 2}} wrapperCol={{span: 12}} initialValue={""}
                                   name={"description"}>
                            <Input.TextArea placeholder={"请输入规则描述"}/>
                        </Form.Item>
                    </Col>
                </Row>
            </ShadowCard>
            <ShadowCard>
                <Row justify={"start"}>
                    <Col span={24}>
                        <Form.Item label={"监控对象"} labelCol={{span: 2}}>
                            <Row justify={"start"}>
                                <Col span={24}>
                                    <Card style={{border: "dashed 1px #ccc", backgroundColor: "#f4f4f4"}}>
                                        <Row justify={"center"}>
                                            <Col>
                                                <Typography.Text>请您选择要监控的对象</Typography.Text>
                                            </Col>
                                        </Row>
                                        <br/>
                                        <Row justify={"center"}>
                                            <Col>
                                                <Button type={"primary"} size={"small"}
                                                        disabled={(selected && selected.sources && selected.sources.length > 0)}
                                                        onClick={_ => setVisible(true)}>选择资源对象</Button>
                                            </Col>
                                        </Row>
                                    </Card>
                                </Col>
                            </Row>
                            <Row justify={"start"}>
                                <Col span={24}>
                                    {
                                        selected && selected.sources && selected.sources.length > 0 &&
                                        <Table columns={sourceColumns} size={"small"} dataSource={selected.sources}
                                               pagination={false}/>
                                    }
                                </Col>
                            </Row>
                        </Form.Item>
                    </Col>
                </Row>
                <Row justify={"space-between"}>
                    <Col span={24}>
                        <Form.Item label={"报警条件"} labelCol={{span: 2}}>
                            <Row justify={"start"}>
                                <Col span={24}>
                                    <Radio.Group buttonStyle="solid" style={{width: "200px"}}
                                                 defaultValue={createType}
                                                 onChange={e => {
                                                     setCreateType(e.target.value)
                                                 }}>
                                        <Radio.Button value={0}>自定义创建</Radio.Button>
                                        <Radio.Button value={1}>模板导入</Radio.Button>
                                    </Radio.Group>
                                </Col>
                            </Row>
                            <Row justify={"start"} style={{paddingTop: "8px"}}>
                                <Col span={24}>
                                    <Card>
                                        <Row justify={"space-between"}>
                                            <Col span={3}>
                                                <Typography.Text>触发条件</Typography.Text>
                                            </Col>
                                            <Col span={20}>
                                                <Space>
                                                    <Typography.Text>当<Typography.Text
                                                        mark>监控对象</Typography.Text>连续</Typography.Text>
                                                    <Form.Item name={["duration"]} noStyle rules={[Rules.number]}>
                                                        <Input size={"small"} style={{width: "64px"}}/>
                                                    </Form.Item>个周期内
                                                    <Form.Item name={["operation"]} noStyle>
                                                        <Select size={"small"} style={{width: "64px"}}>
                                                            <Option key={">"} value={">"}>&gt;</Option>
                                                            <Option key={">="} value={">="}>&gt;=</Option>
                                                            <Option key={"<"} value={"<"}>&lt;</Option>
                                                            <Option key={"<="} value={"<="}>&lt;=</Option>
                                                        </Select>
                                                    </Form.Item>
                                                    <Form.Item name={["threshold"]} normalize={Normalizes.float}
                                                               rules={[Rules.number]} noStyle>
                                                        <Input size={"small"} style={{width: "64px"}}/>
                                                    </Form.Item>时, 产生
                                                    <Form.Item name={["level"]} noStyle>
                                                        <Select size={"small"}
                                                                style={{width: "88px"}}>
                                                            <Option key={1} value={1}>提示</Option>
                                                            <Option key={2} value={2}>重要</Option>
                                                            <Option key={3} value={3}>紧急</Option>
                                                        </Select>
                                                    </Form.Item>报警
                                                </Space>
                                            </Col>
                                        </Row>
                                    </Card>
                                </Col>
                            </Row>
                        </Form.Item>
                    </Col>
                </Row>
                <Row justify={"end"} style={{textAlign: "right"}}>
                    <Col span={24}>
                        <Space>
                            <Button onClick={() => {
                                window.location.hash = "alarm-management?locale=alarmRules&tab=rules"
                            }}>取消</Button>
                            <Button type={"primary"} onClick={onSave}>创建</Button>
                        </Space>
                    </Col>
                </Row>
            </ShadowCard>
        </Form>
        <SourceSelectModal visible={visible}
                           onCancel={() => setVisible(false)}
                           onSuccess={value => {
                               setSelected(value)
                               setVisible(false)
                           }}/>
    </Content>

}

export default AddAlarmRule