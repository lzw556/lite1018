import {Card, Col, Form, Input, Modal, ModalProps, Row, Select, Space, Typography} from "antd";
import {FC, useEffect} from "react";
import {AlarmRule} from "../../../../types/alarm_rule_template";
import {defaultValidateMessages, Normalizes, Rules} from "../../../../constants/validator";
import {UpdateAlarmRuleRequest} from "../../../../apis/alarm";

const {Option} = Select;

export interface EditAlarmRuleModalProps extends ModalProps {
    value: AlarmRule;
    onSuccess?: () => void;
}

const EditAlarmRuleModal: FC<EditAlarmRuleModalProps> = (props) => {
    const {visible, value, onSuccess} = props;
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible){
            form.setFieldsValue({
                description: value.description,
                duration: value.duration,
                operation: value.operation,
                threshold: value.threshold,
                level: value.level,
            })
        }
    }, [visible])

    const onSave = () => {
        form.validateFields().then(values => {
            values.duration = Number(values.duration);
            UpdateAlarmRuleRequest(value.id, values).then(_ => {
                if (onSuccess) onSuccess();
            })
        })
    }

    return <Modal {...props} title={"报警规则编辑"} width={600} onOk={onSave}>
        <Form form={form} labelAlign={"right"} validateMessages={defaultValidateMessages}>
            <Form.Item label={"描述"} name={"description"} labelCol={{span: 4}} wrapperCol={{span: 16}}>
                <Input.TextArea placeholder={"请输入报警规则描述"}/>
            </Form.Item>
            <Form.Item label={"触发条件"} labelCol={{span: 4}}>
                <Row justify={"start"} style={{paddingTop: "8px"}}>
                    <Col span={24}>
                        <Card>
                            <Row justify={"space-between"}>
                                <Col span={24}>
                                    <Space>
                                        <Typography.Text type={"secondary"}>
                                            当<Typography.Text strong>监控对象</Typography.Text>连续
                                        </Typography.Text>
                                        <Form.Item name={["duration"]} noStyle rules={[Rules.number]}>
                                            <Input size={"small"} style={{width: "64px"}}/>
                                        </Form.Item><Typography.Text type={"secondary"}>个周期内</Typography.Text>
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
                                        </Form.Item><Typography.Text type={"secondary"}>时</Typography.Text>
                                    </Space>
                                </Col>
                            </Row>
                            <br/>
                            <Row justify={"space-between"}>
                                <Col span={10}>
                                    <Space>
                                        <Typography.Text type={"secondary"}>产生</Typography.Text>
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
        </Form>
    </Modal>
}

export default EditAlarmRuleModal;