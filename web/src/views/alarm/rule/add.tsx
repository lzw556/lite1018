import {Button, Card, Col, Form, Input, message, Result, Row, Select, Space, Table, Typography} from "antd";
import {Content} from "antd/lib/layout/layout";
import {useCallback, useEffect, useState} from "react";
import {AddAlarmRuleRequest, CheckAlarmRuleNameRequest} from "../../../apis/alarm";
import MyBreadcrumb from "../../../components/myBreadcrumb";
import ShadowCard from "../../../components/shadowCard";
import SourceSelectModal from "./modal/sourceSelectModal";
import {DeleteOutlined} from "@ant-design/icons";
import {defaultValidateMessages, Normalizes, Rules} from "../../../constants/validator";
import { isMobile } from "../../../utils/deviceDetection";
import _ from "lodash";

const {Option} = Select;

const AddAlarmRule = () => {
    const [visible, setVisible] = useState<boolean>(false)
    const [selected, setSelected] = useState<any>()
    const [form] = Form.useForm()
    const [success, setSuccess] = useState<boolean>(false)

    useEffect(() => {
        form.setFieldsValue({
            duration: 1,
            operation: ">=",
            level: 3,
        })
    }, [])


    const onSave = () => {
        form.validateFields().then(values => {
            values.threshold = parseFloat(values.threshold)
            if (selected && selected.sources.length > 0) {
                values.source_ids = selected.sources.map((item: any) => item.id)
                values.source_type = selected.sourceType
                values.category = selected.category
                values.metric = selected.metric
                AddAlarmRuleRequest(values).then(data => {
                    setSuccess(true)
                })
            } else {
                message.error("请选择报警源")
            }
        })
    }

    const onNameValidator = (rule: any, value: any) => {
        return new Promise<void>((resolve, reject) => {
            if (!value) {
                reject("输入不能为空")
                return
            }
            CheckAlarmRuleNameRequest(value).then(data => {
                if (data) {
                    resolve()
                } else {
                    reject("该名称已存在")
                }
            }).catch(_ => reject("该名称已存在"))
        })
    }

    const onRemoveSource = (id: any) => {
        const newSelected = _.cloneDeep(selected)
        newSelected.sources = newSelected.sources.filter((item: any) => item.id !== id)
        setSelected(newSelected)
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

    const renderAlarmRuleForm = () => {
        return <Form form={form} validateMessages={defaultValidateMessages}>
            <ShadowCard>
                <Row justify={"space-between"}>
                    <Col span={24}>
                        <Form.Item label={"规则名称"} labelCol={{span: 2}} wrapperCol={{span: 8}} name={"name"} required
                                   rules={[Rules.range(4, 16), {validator: onNameValidator}]}>
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
                        <Form.Item label={"监控对象"} labelCol={{span: 2}} requiredMark={true}>
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
                                        <Table rowKey={(record) => record.id} columns={sourceColumns} size={"small"} dataSource={selected.sources}
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
                            <Row justify={"start"} style={{paddingTop: "8px"}}>
                                <Col span={24}>
                                    <Card>
                                        <Row justify={"space-between"}>
                                            <Col span={isMobile ? 24 :3}>
                                                <Typography.Text strong>触发条件</Typography.Text>
                                            </Col>
                                            <Col span={isMobile ? 24 :20}>
                                                <Space direction={isMobile ? 'vertical' : 'horizontal'}>
                                                    <Typography.Text type={"secondary"}>
                                                        当<Typography.Text strong>监控对象</Typography.Text>连续
                                                    </Typography.Text>
                                                    <Form.Item name={["duration"]} normalize={Normalizes.number} noStyle
                                                               rules={[Rules.number]}>
                                                        <Input size={"small"} style={{width: "64px"}}/>
                                                    </Form.Item><Typography.Text
                                                    type={"secondary"}>个周期内</Typography.Text>
                                                    <Form.Item name={["operation"]} noStyle>
                                                        <Select size={"small"} style={{width: "64px"}}>
                                                            <Option key={">"} value={">"}>&gt;</Option>
                                                            <Option key={">="} value={">="}>&gt;=</Option>
                                                            <Option key={"<"} value={"<"}>&lt;</Option>
                                                            <Option key={"<="} value={"<="}>&lt;=</Option>
                                                        </Select>
                                                    </Form.Item>
                                                    <Form.Item name={["threshold"]} rules={[Rules.number]} noStyle>
                                                        <Input size={"small"} style={{width: "64px"}}
                                                               suffix={selected?.metric?.unit}/>
                                                    </Form.Item><Typography.Text type={"secondary"}>时,
                                                    产生</Typography.Text>
                                                    <Form.Item name={["level"]} noStyle>
                                                        <Select size={"small"}
                                                                style={{width: "88px"}}>
                                                            <Option key={1} value={1}>提示</Option>
                                                            <Option key={2} value={2}>重要</Option>
                                                            <Option key={3} value={3}>紧急</Option>
                                                        </Select>
                                                    </Form.Item><Typography.Text type={"secondary"}>报警</Typography.Text>
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
    }

    return <Content>
        <MyBreadcrumb/>
        {
            success ? (<ShadowCard>
                <Result
                    status="success"
                    title="报警规则创建成功!"
                    subTitle="您可以返回规则列表查看报警规则信息或者继续创建报警规则"
                    extra={[
                        <Button type="primary" key="alarmRules" onClick={() => {
                            window.location.hash = "alarm-management?locale=alarmRules"
                        }}>
                            返回规则列表
                        </Button>,
                        <Button key="add" onClick={() => {
                            form.resetFields()
                            setSelected(undefined)
                            setSuccess(false)
                        }}>继续创建报警规则</Button>,
                    ]}
                />
            </ShadowCard>) : renderAlarmRuleForm()

        }
        <SourceSelectModal visible={visible}
                           onCancel={() => setVisible(false)}
                           onSuccess={value => {
                               setSelected(value)
                               setVisible(false)
                           }}/>
    </Content>

}

export default AddAlarmRule