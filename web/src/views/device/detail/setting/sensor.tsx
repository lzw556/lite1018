import {Device} from "../../../../types/device";
import {FC, useState} from "react";
import {Card, Col, Form, Input, Row, Select} from "antd";
import Setting from "./setting";
import {SAMPLE_PERIOD_1} from "../../../../constants";
import {DeviceType} from "../../../../types/device_type";
import {defaultValidateMessages, Rules} from "../../../../constants/validator";

export interface SensorSettingProps {
    device: Device
    values: any
}

const {Option} = Select

const SensorSetting: FC<SensorSettingProps> = ({device, values}) => {
    const [sensors, setSensors] = useState(values)

    const onRefreshSetting = (setting: any) => {
        setSensors(Object.assign({}, sensors, setting))
    }

    const isHideSpeedObject = () => {
        return device.typeId !== DeviceType.BoltElongation &&
            device.typeId !== DeviceType.HighTemperatureCorrosion &&
            device.typeId !== DeviceType.NormalTemperatureCorrosion
    }

    const renderSensorSettings = () => {
        switch (device.typeId) {
            case DeviceType.BoltElongation:
                return <>
                    <Row justify={"start"}>
                        <Col span={12}>
                            <Setting device={device} label={"是否启用预紧力计算"} name={"pretightening_is_enabled"}
                                     value={sensors.pretightening_is_enabled}
                                     displayRender={value => value ? "启用" : "禁用"}
                                     editable={setting => {
                                         return <Select
                                             defaultValue={setting.pretightening_is_enabled ? 1 : 0}
                                             size={"small"}
                                             onChange={v => {
                                                 console.log(v === 1)
                                                 setting.pretightening_is_enabled = v === 1
                                             }}>
                                             <Option key={0} value={0}>禁用</Option>
                                             <Option key={1} value={1}>启用</Option>
                                         </Select>
                                     }}
                                     onSuccess={onRefreshSetting}/>
                        </Col>
                    </Row>
                    {
                        sensors.pretightening_is_enabled && <>
                            <Row justify={"start"}>
                                <Col span={12}>
                                    <Setting device={device} name={"initial_pretightening_force"} label={"初始预紧力"}
                                             value={sensors.initial_pretightening_force}
                                             displayRender={value => {
                                                 return value ? `${value}kN` : "-"
                                             }}
                                             editable={setting => {
                                                 return <Input style={{width: "128px"}}
                                                               size={"small"}
                                                               defaultValue={setting.initial_pretightening_force}
                                                               suffix={"kN"}
                                                               onChange={e => {
                                                                   setting.initial_pretightening_force = Number(e.target.value)
                                                               }}/>
                                             }} onSuccess={onRefreshSetting}/>
                                </Col>
                                <Col span={12}>
                                    <Setting device={device} name={"initial_pretightening_length"} label={"初始预紧长度"}
                                             value={sensors.initial_pretightening_length}
                                             displayRender={value => {
                                                 return value ? `${value}mm` : "-"
                                             }}
                                             editable={setting => {
                                                 return <Input style={{width: "128px"}}
                                                               size={"small"}
                                                               defaultValue={setting.initial_pretightening_length}
                                                               suffix={"mm"}
                                                               onChange={e => {
                                                                   setting.initial_pretightening_length = Number(e.target.value)
                                                               }}/>
                                             }} onSuccess={onRefreshSetting}/>
                                </Col>
                            </Row>
                            <Row justify={"start"}>
                                <Col span={12}>
                                    <Setting device={device} name={"pretightening_k"} label={"预紧力系数"}
                                             value={sensors.pretightening_k}
                                             displayRender={value => {
                                                 return value ? `${value}` : "-"
                                             }}
                                             editable={setting => {
                                                 return <Input style={{width: "128px"}}
                                                               size={"small"}
                                                               defaultValue={setting.pretightening_k}
                                                               onChange={e => {
                                                                   setting.pretightening_k = Number(e.target.value)
                                                               }}/>
                                             }} onSuccess={onRefreshSetting}/>
                                </Col>
                                <Col span={12}>
                                    <Setting device={device} name={"elastic_modulus"} label={"弹性模量"}
                                             value={sensors.elastic_modulus}
                                             displayRender={value => {
                                                 return value ? `${value}Gpa` : "-"
                                             }}
                                             editable={setting => {
                                                 return <Input style={{width: "128px"}} size={"small"}
                                                               defaultValue={setting.elastic_modulus}
                                                               suffix={"Gpa"}
                                                               onChange={e => {
                                                                   setting.elastic_modulus = Number(e.target.value)
                                                               }}/>
                                             }} onSuccess={onRefreshSetting}/>
                                </Col>
                            </Row>
                            <Row justify={"start"}>
                                <Col span={12}>
                                    <Setting device={device} name={"sectional_area"} label={"截面积"}
                                             value={sensors.sectional_area}
                                             displayRender={value => {
                                                 return value ? `${value}mm²` : "-"
                                             }}
                                             editable={setting => {
                                                 return <Input style={{width: "128px"}} size={"small"}
                                                               defaultValue={setting.sectional_area}
                                                               suffix={"mm²"}
                                                               onChange={e => {
                                                                   setting.sectional_area = Number(e.target.value)
                                                               }}/>
                                             }} onSuccess={onRefreshSetting}/>
                                </Col>
                                <Col span={12}>
                                    <Setting device={device} name={"clamped_length"} label={"有效受力长度"}
                                             value={sensors.clamped_length}
                                             displayRender={value => {
                                                 return value ? `${value}mm` : "-"
                                             }}
                                             editable={setting => {
                                                 return <Input style={{width: "128px"}} size={"small"}
                                                               defaultValue={setting.clamped_length}
                                                               suffix={"mm"}
                                                               onChange={e => {
                                                                   setting.clamped_length = Number(e.target.value)
                                                               }}/>
                                             }} onSuccess={onRefreshSetting}/>
                                </Col>
                            </Row>
                        </>
                    }
                </>

        }
    }

    return <Card bordered={false} size={"small"}>
        <Form validateMessages={defaultValidateMessages}>
            <Row justify={"start"}>
                <Col span={9}>
                    <Setting device={device} name={"schedule0_sample_period"} label={"采集周期"}
                             value={sensors.schedule0_sample_period}
                             displayRender={value => {
                                 const period = SAMPLE_PERIOD_1.find(p => p.value === value)
                                 if (period) {
                                     return period.text
                                 }
                                 return `${value / 1000}秒`
                             }}
                             editable={item => {
                                 return <Select defaultValue={item.schedule0_sample_period}
                                                size={"small"}
                                                onChange={v => {
                                                    item.schedule0_sample_period = v
                                                }}>
                                     {
                                         SAMPLE_PERIOD_1.map(period => (
                                             <Option key={period.value} value={period.value}>{period.text}</Option>))
                                     }
                                 </Select>
                             }} onSuccess={onRefreshSetting}/>
                </Col>
                <Col span={9} hidden={isHideSpeedObject()}>
                    <Setting device={device} name={"speed_object"} label={"波速"}
                             value={sensors.speed_object}
                             editable={item => {
                                 return <Input size={"small"}
                                               defaultValue={item.speed_object}
                                               onChange={event => {
                                                   item.speed_object = Number(event.target.value)
                                               }}/>
                             }} onSuccess={onRefreshSetting} rules={[Rules.number]}/>
                </Col>
            </Row>
            {
                renderSensorSettings()
            }
        </Form>
    </Card>
}

export default SensorSetting