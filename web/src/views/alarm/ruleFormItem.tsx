import {Col, Form, Input, Row, Select} from "antd";
import {Normalizes, Rules} from "../../constants/validator";
import {FC, useState} from "react";
import {MeasurementField, MeasurementFieldType} from "../../types/measurement_data";

const {Option} = Select;

export interface RuleFormItemProps {
    fields?: MeasurementField[]
}

const RuleFormItem: FC<RuleFormItemProps> = ({fields}) => {
    const [field, setField] = useState<MeasurementField>();

    const onFieldChange = (value: any) => {
        setField(fields?.find(f => f.name === value));
    }

    const renderMethodOption = () => {
        switch (field?.type) {
            case MeasurementFieldType.Float:
                return <Option key={"Current"} value={"Current"}>当前值</Option>
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
                    <Select placeholder={"请选择监测点属性"} onChange={onFieldChange} allowClear={true}>
                        {
                            fields?.filter(item => item.primary).map((item: any) => {
                                return <Option key={item.name} value={item.name}>{item.title}</Option>
                            })
                        }
                    </Select>
                </Form.Item>
            </Col>
            <Col span={10} offset={1}>
                {
                    field &&
                    <Form.Item label={"统计方式"} name={["rule", "method"]} initialValue={"Current"}>
                        <Select size={"middle"} style={{width: "100px"}}>
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