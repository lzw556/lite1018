import {Col, Form, Input, Row, Select} from "antd";
import {Normalizes, Rules} from "../../constants/validator";
import {FC, useEffect, useState} from "react";
import {MeasurementField, MeasurementFieldType} from "../../types/measurement_data";
import {AlarmRule} from "../../types/alarm_rule_template";

const {Option} = Select;

export interface RuleFormItemProps {
    fields?: MeasurementField[]
    defaultValue?: AlarmRule
}

const RuleFormItem: FC<RuleFormItemProps> = ({fields, defaultValue}) => {
    const [field, setField] = useState<MeasurementField>();
    const [options, setOptions] = useState<any>()

    useEffect(() => {
        if (defaultValue) {
            setField(fields?.find(f => f.name === defaultValue?.field));
        }
    }, [fields]);


    const onFieldChange = (value: any) => {
        setField(fields?.find(f => f.name === value));
    }

    const renderMethodOption = () => {
        switch (field?.type) {
            case MeasurementFieldType.Float:
                return <Option key={"Current"} value={"Current"}>当前值</Option>
            case MeasurementFieldType.Axis:
                return <>
                    <Option key={"X"} value={"X"}>X轴</Option>
                    <Option key={"Y"} value={"Y"}>Y轴</Option>
                    <Option key={"Z"} value={"Z"}>Z轴</Option>
                </>
            case MeasurementFieldType.Array:
                return <>
                    <Option key={"Max"} value={"Max"}>最大值</Option>
                    <Option key={"Min"} value={"Min"}>最小值</Option>
                    <Option key={"Mean"} value={"Mean"}>平均值</Option>
                </>
        }
    }

    return <>
        <Row justify={"start"}>
            <Col span={12}>
                <Form.Item label={"报警属性"} name={["rule", "field"]} rules={[Rules.required]}>
                    <Select placeholder={"请选择监测点属性"} onChange={onFieldChange}>
                        {fields?.map(f => <Option key={f.name} value={f.name}>{f.title}</Option>)}
                    </Select>
                </Form.Item>
            </Col>
            <Col span={10} offset={1}>
                {
                    field &&
                    <Form.Item label={"统计方式"} name={["rule", "method"]}>
                        <Select size={"middle"} placeholder={"请选择统计方式"} style={{width: "130px"}}>
                            {
                                renderMethodOption()
                            }
                        </Select>
                    </Form.Item>
                }
            </Col>
        </Row>
        <Row justify={"start"}>
            <Col span={7}>
                <Form.Item required label={"阈值条件"} name={["rule", "operation"]}
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
                <Form.Item name={["rule", "threshold"]} normalize={Normalizes.float} rules={[Rules.number]}>
                    <Input placeholder={"报警阈值"} size={"middle"}
                           suffix={field?.unit}/>
                </Form.Item>
            </Col>
        </Row>
    </>
}

export default RuleFormItem;