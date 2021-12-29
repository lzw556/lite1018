import {Button, Card, Col, Form, Input, message, Radio, Row, Select, Space, Tree} from "antd";
import {Content} from "antd/lib/layout/layout";
import {useCallback, useEffect, useState} from "react";
import {Footer} from "antd/es/layout/layout";
import {useHistory} from "react-router-dom";
import {AddAlarmRequest, CheckRuleNameRequest, PagingAlarmTemplateRequest} from "../../../apis/alarm";
import {defaultValidateMessages, Rules} from "../../../constants/validator";
import MyBreadcrumb from "../../../components/myBreadcrumb";
import MeasurementTypeSelect from "../../../components/select/measurementTypeSelect";
import {GetMeasurementFieldsRequest, GetMeasurementsRequest} from "../../../apis/measurement";
import {Measurement} from "../../../types/measurement";
import {MeasurementField} from "../../../types/measurement_data";
import {MeasurementType} from "../../../types/measurement_type";
import RuleFormItem from "../ruleFormItem";
import TableLayout from "../../layout/TableLayout";
import {PageResult} from "../../../types/page";

const {Option} = Select

const AddRulePage = () => {
    const [selectedTemplates, setSelectedTemplates] = useState<number[]>([])
    const [selectedMeasurements, setSelectedMeasurements] = useState<number[]>([])
    const [measurements, setMeasurements] = useState<Measurement[]>()
    const [fields, setFields] = useState<MeasurementField[]>()
    const [field, setField] = useState<MeasurementField>()
    const [dataSource, setDataSource] = useState<PageResult<any>>()
    const [type, setType] = useState<MeasurementType>()
    const [createType, setCreateType] = useState<number>(0)
    const [form] = Form.useForm()
    const history = useHistory()

    const fetchAlarmTemplates = useCallback((current: number, size: number) => {
        PagingAlarmTemplateRequest(current, size, {measurement_type: type}).then(setDataSource)
    }, [type])

    useEffect(() => {
        if (type) {
            form.resetFields(["field"])
            setField(undefined)
            GetMeasurementsRequest({type}).then(setMeasurements)
            if (createType === 1) {
                fetchAlarmTemplates(1, 10)
            } else {
                GetMeasurementFieldsRequest(type).then(setFields)
            }
        }
    }, [createType, type, fetchAlarmTemplates])


    const convertTreeData = () => {
        return measurements?.map(measurement => {
            return {
                title: measurement.name,
                key: measurement.id,
                checkable: true,
            }
        })
    }

    const onSave = () => {
        form.validateFields().then(values => {
            if (selectedMeasurements.length > 0) {
                const req = {
                    name: values.name,
                    measurement_ids: selectedMeasurements,
                    description: form.getFieldValue("description")
                }
                if (createType === 1) {
                    createByTemplates(req)
                } else {
                    createByCustom(req)
                }
            } else {
                message.info("请先选择设备").then()
            }
        }).catch(err => {
            message.error(err)
        })
    }

    const createByTemplates = (req: any) => {
        if (selectedTemplates.length > 0) {
            const params = {...req, template_ids: selectedTemplates}
            createAlarmRule(params)
        } else {
            message.info("请先选择模板").then()
        }
    }

    const createByCustom = (req: any) => {
        form.validateFields().then(values => {
            createAlarmRule({...req, ...values})
        })
    }

    const createAlarmRule = (params: any) => {
        console.log(params)
        AddAlarmRequest(createType, params).then(_ => history.goBack())
    }

    const onSelect = (keys: any) => {
        setSelectedMeasurements(keys)
    }

    const onNameValidator = (rule: any, value: any) => {
        return new Promise<void>((resolve, reject) => {
            if (!value) {
                reject("输入不能为空")
                return
            }
            CheckRuleNameRequest(value).then(_ => resolve()).catch(_ => reject("该名称已存在"))
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
            return <TableLayout emptyText={"报警规则模板为空"}
                                columns={columns}
                                dataSource={dataSource}
                                rowSelection={rowSelection}
                                onPageChange={fetchAlarmTemplates}/>
        } else {
            return <Card type={"inner"} size={"small"} title={"自定义规则"} bordered={false}>
                <RuleFormItem fields={fields}/>
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
        <MyBreadcrumb/>
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
                        <Form.Item label={"监测点类型"} name={"measurement_type"} labelCol={{span: 4}}
                                   rules={[Rules.required]}>
                            <MeasurementTypeSelect
                                placeholder={"请选择监测点类型"}
                                style={{"width": "200px"}}
                                onChange={setType}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row justify={"space-between"}>
                    <Col span={7} offset={1}>
                        <Card type={"inner"} size={"small"} title={"选择监测点"}
                              style={{height: "512px", backgroundColor: "#f4f5f6"}}>
                            <Tree
                                selectable={false}
                                checkable
                                showIcon
                                selectedKeys={selectedMeasurements}
                                style={{height: "100%", backgroundColor: "#f4f5f6"}}
                                treeData={convertTreeData()}
                                onCheck={onSelect}
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
                    window.location.hash = "alarm-management?locale=alarmRules&tab=rules"
                }}>取消</Button>
                <Button type={"primary"} onClick={onSave}>创建</Button>
            </Space>
        </Footer>
    </Content>

}

export default AddRulePage