import {
    Button,
    Card,
    Cascader,
    Col,
    ConfigProvider,
    Form,
    Input,
    message,
    Radio,
    Row,
    Select,
    Space,
    Table,
    Tree
} from "antd";
import {Content} from "antd/lib/layout/layout";
import {useEffect, useState} from "react";
import DeviceTypeSelect from "../../../components/deviceTypeSelect";
import {GetDeviceGroupByAsset} from "../../../apis/device";
import {Property} from "../../../types/property";
import {GetPropertiesRequest} from "../../../apis/property";
import {Footer} from "antd/es/layout/layout";
import {useHistory} from "react-router-dom";
import {AddAlarmRuleRequest, CheckRuleNameRequest, PagingRuleTemplateRequest} from "../../../apis/alarm";
import {defaultValidateMessages, numberRule} from "../../../constants/validateMessage";
import {EmptyLayout} from "../../layout";
import {GetFieldName} from "../../../constants/field";
import MyBreadcrumb from "../../../components/myBreadcrumb";

const {Option} = Select

const AddRulePage = () => {
    const [groups, setGroups] = useState<any>([])
    const [properties, setProperties] = useState<Property[]>([])
    const [selectedTemplates, setSelectedTemplates] = useState<number[]>([])
    const [selectedDevices, setSelectedDevices] = useState<number[]>([])
    const [property, setProperty] = useState<Property>()
    const [templates, setTemplates] = useState<any>()
    const [deviceType, setDeviceType] = useState(0)
    const [createType, setCreateType] = useState<number>(0)
    const [form] = Form.useForm()
    const history = useHistory()

    useEffect(() => {
        if (deviceType) {
            GetDeviceGroupByAsset(deviceType).then(res => {
                if (res.code === 200) {
                    setGroups(res.data)
                }
            })
            if (createType === 1) {
                PagingRuleTemplateRequest(1, 100, deviceType).then(res => {
                    if (res.code === 200) {
                        setTemplates(res.data.result)
                    }
                })
            } else {
                GetPropertiesRequest(deviceType).then(res => {
                    if (res.code === 200) {
                        setProperties(res.data)
                    }
                })
            }
        }
    }, [createType, deviceType])

    const onDeviceTypeChanged = (value: any) => {
        setDeviceType(value)
    }

    const convertTreeData = () => {
        return groups.map((group: any) => {
            return {
                title: `资产: ${group.name}`,
                key: group.id,
                checkable: false,
                children: group.devices.map((item: any) => {
                    return {
                        title: `设备: ${item.name}`,
                        key: item.id,
                    }
                })
            }
        })
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

    const onPropertyChanged = (values: any) => {
        setProperty(properties.find(item => item.id === values[0]))
    }

    const onSave = () => {
        form.validateFields(["name", "device_type"]).then(values => {
            if (selectedDevices.length > 0) {
                const req = {
                    name: values.name,
                    device_ids: selectedDevices,
                    device_type: values.device_type,
                    create_type: createType,
                    description: form.getFieldValue("description")
                }
                if (createType === 1) {
                    onCreateFromTemplates(req)
                } else {
                    onCreateByCustom(req)
                }
            } else {
                message.info("请先选择设备").then()
            }
        }).catch(_ => {

        })
    }

    const onCreateFromTemplates = (req: any) => {
        if (selectedTemplates.length > 0) {
            const params = Object.assign({}, req, {
                template_ids: selectedTemplates
            })
            createAlarmRule(params)
        } else {
            message.info("请先选择模板").then()
        }
    }

    const onCreateByCustom = (req: any) => {
        form.validateFields(["property", "threshold"]).then(values => {
            const params = Object.assign({}, req, {
                property_id: values.property[0],
                rule: {
                    field: values.property[1],
                    method: form.getFieldValue("method"),
                    operation: form.getFieldValue("operation"),
                    threshold: parseFloat(values.threshold),
                },
                level: form.getFieldValue("level")
            })
            createAlarmRule(params)
        })
    }

    const createAlarmRule = (params: any) => {
        AddAlarmRuleRequest(params).then(res => {
            if (res.code === 200) {
                message.success("添加成功").then()
                history.goBack()
            } else {
                message.error("添加失败").then()
            }
        })
    }

    const onDevicesSelected = (keys: any) => {
        setSelectedDevices(keys)
    }

    const onNameValidator = (rule: any, value: any) => {
        return new Promise((resolve, reject) => {
            if (!value) {
                reject("输入不能为空")
                return
            }
            CheckRuleNameRequest(value).then(res => {
                if (res.code === 200) {
                    resolve(null)
                } else {
                    reject(res.msg)
                }
            })
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

    const renderFormItem = () => {
        if (createType) {
            return <ConfigProvider renderEmpty={() => {
                return <EmptyLayout description={"模板列表为空"}/>
            }}>
                <Table rowKey={(record: any) => record.id} rowSelection={rowSelection} columns={columns}
                       dataSource={templates} pagination={false} size={"small"}/>
            </ConfigProvider>
        } else {
            return <Card type={"inner"} size={"small"} title={"自定义规则"} bordered={false}>
                <Row justify={"start"}>
                    <Col span={12}>
                        <Form.Item label={"设备属性"} name={"property"} rules={[{required: true, message: "请选择设备属性"}]}>
                            <Cascader size={"middle"} placeholder={"请选择设备属性"} options={renderPropertyOptions()}
                                      onChange={onPropertyChanged}/>
                        </Form.Item>
                    </Col>
                    <Col span={10} offset={1}>
                        <Form.Item label={"统计方式"} name={"method"} initialValue={"current"}>
                            <Select size={"middle"} style={{width: "100px"}}>
                                <Option key={"current"} value={"current"}>当前值</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row justify={"start"}>
                    <Col span={7}>
                        <Form.Item required label={"阈值条件"} name={"operation"}
                                   initialValue={">"}>
                            <Select size={"middle"} defaultActiveFirstOption={true}
                                    style={{width: "64px"}}>
                                <Option key={">"} value={">"}>&gt;</Option>
                                <Option key={">="} value={">="}>&gt;=</Option>
                                <Option key={"<"} value={"<"}>&lt;</Option>
                                <Option key={"<="} value={"<="}>&lt;=</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={5}>
                        <Form.Item name={"threshold"} rules={[numberRule]}>
                            <Input placeholder={"报警阈值"} size={"middle"}
                                   suffix={property?.unit}/>
                        </Form.Item>
                    </Col>
                </Row>
                <Row justify={"start"}>
                    <Col span={12}>
                        <Form.Item label={"报警级别"} name={"level"} initialValue={1} required>
                            <Select defaultActiveFirstOption={true} size={"middle"}>
                                <Option key={1} value={1}>提示</Option>
                                <Option key={2} value={2}>重要</Option>
                                <Option key={3} value={3}>紧急</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
            </Card>
        }
    }

    return <Content>
        <MyBreadcrumb items={["报警管理", "报警规则", "添加规则"]}/>
        <Card>
            <Form form={form} labelAlign={"right"} validateMessages={defaultValidateMessages}>
                <Row justify={"space-between"}>
                    <Col span={16}>
                        <Form.Item label={"规则名称"} labelCol={{span: 4}} name={"name"} required
                                   rules={[{validator: onNameValidator}]}>
                            <Input placeholder={"请输入规则名称"} style={{width: "200px"}}/>
                        </Form.Item>
                    </Col>
                </Row>
                <Row justify={"space-between"}>
                    <Col span={16}>
                        <Form.Item label={"规则描述"} labelCol={{span: 4}} initialValue={""} name={"description"}>
                            <Input.TextArea placeholder={"请输入规则描述"}/>
                        </Form.Item>
                    </Col>
                </Row>
                <Row justify={"space-between"}>
                    <Col span={8} offset={1}>
                        <Form.Item label={"创建方式"} name={"create_type"} initialValue={createType}>
                            <Radio.Group buttonStyle="solid" style={{width: "200px"}} onChange={e => {
                                setCreateType(e.target.value)
                            }}>
                                <Radio.Button value={0}>自定义创建</Radio.Button>
                                <Radio.Button value={1}>模板导入</Radio.Button>
                            </Radio.Group>
                        </Form.Item>
                    </Col>
                </Row>
                <Row justify={"space-between"}>
                    <Col span={16}>
                        <Form.Item label={"设备类型"} name={"device_type"} labelCol={{span: 4}}
                                   rules={[{required: true, message: "请先选择设备类型"}]}>
                            <DeviceTypeSelect sensor={true} placeholder={"请选择设备类型"} style={{width: "200px"}}
                                              onChange={onDeviceTypeChanged}/>
                        </Form.Item>
                    </Col>
                </Row>
                <Row justify={"space-between"}>
                    <Col span={7} offset={1}>
                        <Card type={"inner"} size={"small"} title={"选择设备"}
                              style={{height: "512px", backgroundColor: "#f4f5f6"}}>
                            <Tree
                                selectable={false}
                                checkable
                                showIcon
                                selectedKeys={selectedDevices}
                                style={{height: "100%", backgroundColor: "#f4f5f6"}}
                                treeData={convertTreeData()}
                                onCheck={onDevicesSelected}
                            />
                        </Card>
                    </Col>
                    <Col span={15}>
                        {
                            renderFormItem()
                        }
                    </Col>
                </Row>
            </Form>
        </Card>
        <Footer style={{position: "fixed", bottom: 0, right: 0, background: "transparent"}}>
            <Space>
                <Button onClick={() => {
                    history.push({
                        pathname: "/alarm-management/alarmRules",
                        state: {tab: "rules"}
                    })
                }}>取消</Button>
                <Button type={"primary"} onClick={onSave}>创建</Button>
            </Space>
        </Footer>
    </Content>

}

export default AddRulePage