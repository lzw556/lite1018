import MyBreadcrumb from "../../../components/myBreadcrumb";
import {Button, Card, Col, Form, Input, Row, Select, Space} from "antd";
import MeasurementTypeSelect from "../../../components/select/measurementTypeSelect";
import RuleFormItem from "../ruleFormItem";
import {Content} from "antd/lib/layout/layout";
import {useState} from "react";
import {MeasurementField} from "../../../types/measurement_data";
import {GetMeasurementFieldsRequest} from "../../../apis/measurement";
import {AddAlarmTemplateRequest} from "../../../apis/alarm";
import {useHistory} from "react-router-dom";

const {Option} = Select;

const AddAlarmRuleTemplate = () => {
    const history = useHistory();
    const [form] = Form.useForm();
    const [fields, setFields] = useState<MeasurementField[]>([]);

    const onMeasurementTypeChange = (value:number) => {
        GetMeasurementFieldsRequest(value).then(setFields)
    }

    const onAdd = () => {
        form.validateFields().then(values => {
            AddAlarmTemplateRequest(values).then(_ => {
                history.goBack();
            })
        })
    }

    return <Content>
        <MyBreadcrumb/>
        <Row justify="center">
            <Col span={24}>
                <Card style={{padding: "10px"}}>
                    <Form form={form} labelCol={{span: 8}} labelAlign={"right"}>
                        <Row justify={"start"}>
                            <Col span={16}>
                                <Form.Item label={"模板名称"} name="name"
                                           labelCol={{span: 4}}
                                           rules={[{required: true, message: "请输入模板名称"}]}>
                                    <Input placeholder="请输入模板名称" style={{width: "225px"}}/>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row justify={"start"}>
                            <Col span={16}>
                                <Form.Item labelCol={{span: 4}} label={"监测点类型"} name="measurement_type"
                                           rules={[{required: true, message: "请选择设备类型"}]}>
                                    <MeasurementTypeSelect placeholder={"请选择监测点类型"}
                                                           style={{width: "225px"}}
                                                           onChange={onMeasurementTypeChange}/>
                                </Form.Item>
                                <Form.Item label={"  "} labelCol={{span: 4}} colon={false}>
                                    <Card type={"inner"} bordered={false} size={"small"}
                                          style={{padding: "4px", background: "#eef0f5"}}>
                                        <RuleFormItem fields={fields}/>
                                    </Card>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row justify={"start"}>
                            <Col span={16}>
                                <Form.Item labelCol={{span: 4}}
                                           label={"模板描述"}
                                           initialValue={""}
                                           name="description">
                                    <Input.TextArea placeholder={"请输入描述信息"}/>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row justify={"start"}>
                            <Col span={16}>
                                <Form.Item label={"报警级别"} required
                                           labelCol={{span: 4}}
                                           name={"level"}>
                                    <Select defaultActiveFirstOption={true}
                                            placeholder={"请选择报警级别"}
                                            style={{width: "200px"}}>
                                        <Option key={1} value={1}>次要</Option>
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
                                        window.location.hash = "alarm-management?locale=alarmRules&tab=templates"
                                    }}>取消</Button>
                                    <Button type="primary" onClick={onAdd}>创建</Button>
                                </Space>
                            </Col>
                        </Row>
                    </Form>
                </Card>
            </Col>
        </Row>
    </Content>
}

export default AddAlarmRuleTemplate