import {Alarm} from "../../../../types/alarm_rule";
import {Col, Form, Input, Modal, Row, Select} from "antd";
import {FC, useEffect, useState} from "react";
import {defaultValidateMessages} from "../../../../constants/validator";
import {UpdateAlarmRuleRequest} from "../../../../apis/alarm";
import {GetMeasurementFieldsRequest} from "../../../../apis/measurement";
import {MeasurementField} from "../../../../types/measurement_data";

export interface EditProps {
    alarm: Alarm
    visible: boolean
    onCancel?: () => void
    onSuccess: () => void
}

const {Option} = Select

const EditModal: FC<EditProps> = ({visible, alarm, onCancel, onSuccess}) => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [field, setField] = useState<MeasurementField>()
    const [form] = Form.useForm()

    useEffect(() => {
        if (visible) {
            GetMeasurementFieldsRequest(alarm.measurement.type).then(data => {
                setField(data.find(item => item.name === alarm.rule.field))
                form.setFieldsValue({
                    field: data.find(item => item.name === alarm.rule.field)?.title,
                    operation: alarm.rule.operation,
                    threshold: alarm.rule.threshold,
                    level: alarm.level,
                })
            })
        }
    }, [visible])

    const onSave = () => {
        setIsLoading(true)
        form.validateFields().then(values => {
            setIsLoading(false)
            UpdateAlarmRuleRequest(alarm.id, {
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

    return <Modal width={380} visible={visible} title={"阈值修改"} okText={"更新"} onOk={onSave} cancelText={"取消"}
                  onCancel={onCancel} confirmLoading={isLoading}>
        <Form form={form} validateMessages={defaultValidateMessages}>
            <Row justify={"start"}>
                <Col span={24}>
                    <Form.Item label={"属性名称"} name="field">
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
                        <Input suffix={field?.unit}/>
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