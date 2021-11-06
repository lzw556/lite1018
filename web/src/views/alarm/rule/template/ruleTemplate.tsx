import {FC, useEffect, useState} from "react";
import {Property} from "../../../../types/property";
import {Button, Card, Cascader, Col, Form, Input, Row, Select, Space} from "antd";
import {GetPropertiesRequest} from "../../../../apis/property";
import {Content} from "antd/lib/layout/layout";
import DeviceTypeSelect from "../../../../components/deviceTypeSelect";
import {AlarmRuleTemplate} from "../../../../types/alarm_rule_template";
import {useHistory} from "react-router-dom";
import {GetFieldName} from "../../../../constants/field";

const {Option} = Select

export interface RuleTemplateProps {
    defaultValue?: AlarmRuleTemplate
    onOk: (value: any) => void
    okText: string
}

const RuleTemplate: FC<RuleTemplateProps> = ({defaultValue, onOk, okText}) => {
    const [properties, setProperties] = useState<Property[]>([])
    const [property, setProperty] = useState(defaultValue?.property)
    const [rule, setRule] = useState(defaultValue?.rule)
    const [deviceType, setDeviceType] = useState<number>(defaultValue ? defaultValue.deviceType : 0)
    const [form] = Form.useForm()
    const history = useHistory()

    useEffect(() => {
        if (deviceType) {
            GetPropertiesRequest(deviceType).then(res => {
                if (res.code === 200) {
                    setProperties(res.data)
                }
            })
        }
    }, [deviceType])

    const onDeviceTypeChanged = (value: any) => {
        setDeviceType(value)
        setProperties([])
        setProperty(undefined)
        setRule(undefined)
        form.resetFields(["property", "threshold"])
    }

    const onPropertyChanged = (values: any) => {
        setProperty(properties.find(item => item.id === values[0]))
    }

    const renderPropertyOptions = () => {
        return properties.map(item => {
            return {
                value: item.id,
                label: item.name,
                children: item.fields.map(item => {
                    return {
                        value: item.name,
                        label: GetFieldName(item.name),
                    }
                })
            }
        })
    }

    const onClick = () => {
        form.validateFields().then(values => {
            onOk({
                id: defaultValue ? defaultValue.id : 0,
                name: values.name,
                device_type: values.device_type,
                property_id: values.property[0],
                rule: {
                    field: values.property[1],
                    method: values.method,
                    operation: values.operation,
                    threshold: Number(values.threshold),
                },
                level: values.level,
                description: form.getFieldValue("description")
            })
        })
    }

    return <div>
        <Row justify="center">
            <Col span={24} style={{textAlign: "right"}}>
            </Col>
        </Row>
        <Row justify="center">
            <Col span={24}>
                <Content style={{paddingTop: "35px"}}>
                    <Card style={{padding: "10px"}}>
                        <Form form={form} labelCol={{span: 8}} labelAlign={"right"}>
                            <Row justify={"start"}>
                                <Col span={16}>
                                    <Form.Item label={"模板名称"} name="name"
                                               labelCol={{span: 4}}
                                               initialValue={defaultValue?.name}
                                               rules={[{required: true, message: "请输入模板名称"}]}>
                                        <Input placeholder="请输入模板名称" style={{width: "225px"}}/>
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row justify={"start"}>
                                <Col span={16}>
                                    <Form.Item labelCol={{span: 4}} label={"设备类型"} name="device_type"
                                               initialValue={deviceType ? deviceType : null}
                                               rules={[{required: true, message: "请选择设备类型"}]}>
                                        <DeviceTypeSelect sensor={true} placeholder={"请选择设备类型"}
                                                          onChange={onDeviceTypeChanged} style={{width: "225px"}}/>
                                    </Form.Item>
                                    <Form.Item label={"  "} labelCol={{span: 4}} colon={false}>
                                        <Card type={"inner"} bordered={false} size={"small"}
                                              style={{padding: "4px", background: "#eef0f5"}}>
                                            <Row justify={"start"}>
                                                <Col span={12}>
                                                    <Form.Item required label={"设备属性"} name={"property"}
                                                               initialValue={property && rule ? [property.id, rule.field] : []}>
                                                        <Cascader size={"small"} placeholder={"请选择设备属性"}
                                                                  options={renderPropertyOptions()}
                                                                  onChange={onPropertyChanged}/>
                                                    </Form.Item>
                                                </Col>
                                                <Col span={10} offset={1}>
                                                    <Form.Item required label={"统计方式"} name={"method"}
                                                               initialValue={rule ? rule.method : "current"}>
                                                        <Select size={"small"} style={{width: "80px"}}>
                                                            <Option key={"current"} value={"current"}>当前值</Option>
                                                        </Select>
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                            <Row justify={"start"}>
                                                <Col span={7}>
                                                    <Form.Item required label={"阈值条件"} name={"operation"}
                                                               initialValue={rule ? rule.operation : ">"}>
                                                        <Select size={"small"} defaultActiveFirstOption={true}
                                                                style={{width: "64px"}}>
                                                            <Option key={">"} value={">"}>&gt;</Option>
                                                            <Option key={">="} value={">="}>&gt;=</Option>
                                                            <Option key={"<"} value={"<"}>&lt;</Option>
                                                            <Option key={"<="} value={"<="}>&lt;=</Option>
                                                        </Select>
                                                    </Form.Item>
                                                </Col>
                                                <Col span={5}>
                                                    <Form.Item name={"threshold"} initialValue={rule?.threshold}>
                                                        <Input placeholder={"报警阈值"} size={"small"}
                                                               suffix={property?.unit}/>
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </Card>
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row justify={"start"}>
                                <Col span={16}>
                                    <Form.Item labelCol={{span: 4}}
                                               initialValue={defaultValue ? defaultValue.description : ""}
                                               label={"模板描述"} name="description">
                                        <Input.TextArea placeholder={"请输入描述信息"}/>
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row justify={"start"}>
                                <Col span={16}>
                                    <Form.Item label={"报警级别"} required labelCol={{span: 4}}
                                               initialValue={defaultValue ? defaultValue.level : 1} name={"level"}>
                                        <Select defaultActiveFirstOption={true} style={{width: "128px"}}>
                                            <Option key={1} value={1}>提示</Option>
                                            <Option key={2} value={2}>重要</Option>
                                            <Option key={3} value={3}>紧急</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                            <br/>
                            <Row justify={"start"}>
                                <Col span={16} style={{textAlign: "right"}}>
                                    <Space>
                                        <Button onClick={() => {
                                            history.push({
                                                pathname: "/alarm-management/alarmRules",
                                                state: {tab: "templates"}
                                            })
                                        }}>取消</Button>
                                        <Button type="primary" onClick={onClick}>{okText}</Button>
                                    </Space>
                                </Col>
                            </Row>
                        </Form>
                    </Card>
                </Content>
            </Col>
        </Row>
    </div>
}

export default RuleTemplate