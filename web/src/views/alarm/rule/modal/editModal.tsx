import {AlarmRule} from "../../../../types/alarm_rule";
import {Col, Form, Input, Modal, Row, Select} from "antd";
import {FC, useEffect, useState} from "react";
import {defaultValidateMessages} from "../../../../constants/validator";
import {UpdateAlarmRuleRequest} from "../../../../apis/alarm";
import {GetFieldName} from "../../../../constants/field";

export interface EditProps {
    rule?: AlarmRule
    visible: boolean
    onCancel?: () => void
    onSuccess: () => void
}

const {Option} = Select

const EditModal: FC<EditProps> = ({visible, rule, onCancel, onSuccess}) => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [form] = Form.useForm()

    useEffect(() => {
        if (visible) {
            form.setFieldsValue({
                property: rule ? `${rule.property.name}/${GetFieldName(rule.rule.field)}` : null,
                operation: rule ? rule.rule.operation : ">",
                threshold: rule?.rule.threshold,
                level: rule?.level,
            })
        }
    }, [visible])

    const onSave = () => {
        if (rule) {
            setIsLoading(true)
            form.validateFields().then(values => {
                setIsLoading(false)
                UpdateAlarmRuleRequest(rule.id, {
                    rule: {
                        operation: values.operation,
                        threshold: parseFloat(values.threshold),
                    },
                    level: values.level,
                }).then(_ => onSuccess())
            }).catch(_ =>
                setIsLoading(false)
            )
        }
    }

    return <Modal width={380} visible={visible} title={"阈值修改"} okText={"更新"} onOk={onSave} cancelText={"取消"}
                  onCancel={onCancel} confirmLoading={isLoading}>
        <Form form={form} validateMessages={defaultValidateMessages}>
            <Row justify={"start"}>
                <Col span={24}>
                    <Form.Item label={"属性名称"} name="property">
                        <Input disabled/>
                    </Form.Item>
                </Col>
            </Row>
            <Row justify={"start"}>
                <Col span={12}>
                    <Form.Item label={"阈值条件"} labelCol={{span: 0}}
                               name={"operation"} rules={[{required: true, message: "请选择阈值条件"}]}>
                        <Select size={"middle"} defaultActiveFirstOption={true}
                                style={{width: "64px"}}>
                            <Option key={">"} value={">"}>&gt;</Option>
                            <Option key={">="} value={">="}>&gt;=</Option>
                            <Option key={"<"} value={"<"}>&lt;</Option>
                            <Option key={"<="} value={"<="}>&lt;=</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item noStyle name={"threshold"} rules={[{
                        required: true, type: "number", transform(value: any) {
                            if (value) {
                                return Number(value)
                            }
                        }
                    }]}>
                        <Input suffix={rule?.property.unit}/>
                    </Form.Item>
                </Col>
            </Row>
            <Row justify={"start"}>
                <Col span={24}>
                    <Form.Item label={"报警级别"} name={"level"} rules={[{required: true, message: "请选择报警级别"}]}>
                        <Select defaultActiveFirstOption={true} size={"middle"}>
                            <Option key={1} value={1}>提示</Option>
                            <Option key={2} value={2}>重要</Option>
                            <Option key={3} value={3}>紧急</Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
        </Form>
    </Modal>
}

export default EditModal