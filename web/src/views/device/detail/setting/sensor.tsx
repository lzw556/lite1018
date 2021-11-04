import {Device} from "../../../../types/device";
import {FC, useState} from "react";
import {Card, Col, Input, Row, Select} from "antd";
import Setting from "./setting";
import {SAMPLE_PERIOD_1} from "../../../../constants";
import {DeviceType} from "../../../../types/device_type";

export interface SensorSettingProps {
    device: Device
    values: any
}

const {Option} = Select

const SensorSetting: FC<SensorSettingProps> = ({device, values}) => {
    const [sensors, setSensors] = useState(values)

    const onRefreshSetting = (setting: any) => {
        setSensors(Object.assign({}, values, setting))
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
                        <Col span={9}>
                            <Setting device={device} renderValue={item => {
                                return item ? `${item}kN` : "-"
                            }} value={sensors.initial_pretightening_force}
                                     name={"initial_pretightening_force"} title={"初始预紧力"} editable={true}
                                     renderEdit={item => {
                                         return <Input style={{width: "128px"}} size={"small"} type={"number"}
                                                       defaultValue={item.initial_pretightening_force} suffix={"kN"}/>
                                     }} onSuccess={onRefreshSetting}/>
                        </Col>
                        <Col span={9}>
                            <Setting device={device} renderValue={item => {
                                return item ? `${item}mm` : "-"
                            }}
                                     value={sensors.initial_pretightening_length}
                                     name={"initial_pretightening_length"} title={"初始预紧长度"} editable={true}
                                     renderEdit={item => {
                                         return <Input style={{width: "128px"}} size={"small"} defaultValue={item.initial_pretightening_length}
                                                       type={"number"} suffix={"mm"}/>
                                     }} onSuccess={onRefreshSetting}/>
                        </Col>
                    </Row>
                    <Row justify={"start"}>
                        <Col span={9}>
                            <Setting device={device} name={"pretightening_k"} renderValue={item => {
                                return item ? `${item}` : "-"
                            }} value={sensors.pretightening_k} title={"预紧力系数"} editable={true} renderEdit={item => {
                                return <Input style={{width: "128px"}} type={"number"} size={"small"} defaultValue={item.pretightening_k}/>
                            }} onSuccess={onRefreshSetting}/>
                        </Col>
                        <Col span={9}>
                            <Setting device={device} name={"elastic_modulus"} renderValue={item => {
                                return item ? `${item}Gpa` : "-"
                            }} value={sensors.elastic_modulus} title={"弹性模量"} editable={true} renderEdit={item => {
                                return <Input style={{width: "128px"}} size={"small"} type={"number"} defaultValue={item.elastic_modulus}
                                              suffix={"Gpa"}/>
                            }} onSuccess={onRefreshSetting}/>
                        </Col>
                    </Row>
                    <Row justify={"start"}>
                        <Col span={9}>
                            <Setting device={device} name={"sectional_area"} renderValue={item => {
                                return item ? `${item}mm²` : "-"
                            }} value={sensors.sectional_area} title={"截面积"} editable={true} renderEdit={item => {
                                return <Input style={{width: "128px"}} type={"number"} size={"small"} defaultValue={item.sectional_area}
                                              suffix={"mm²"}/>
                            }} onSuccess={onRefreshSetting}/>
                        </Col>
                        <Col span={9}>
                            <Setting device={device} name={"clamped_length"} renderValue={item => {
                                return item ? `${item}mm` : "-"
                            }} value={sensors.clamped_length} title={"有效受力长度"} editable={true} renderEdit={item => {
                                return <Input style={{width: "128px"}} size={"small"} type={"number"} defaultValue={item.clamped_length}
                                              suffix={"mm"}/>
                            }} onSuccess={onRefreshSetting}/>
                        </Col>
                    </Row>
                </>

        }
    }

    return <Card bordered={false} size={"small"}>
        <Row justify={"start"}>
            <Col span={9}>
                <Setting device={device} name={"schedule0_sample_period"} title={"采集周期"}
                         value={sensors.schedule0_sample_period}
                         renderValue={item => {
                             const period = SAMPLE_PERIOD_1.find(p => p.value === item)
                             if (period) {
                                 return period.text
                             }
                             return `${item / 1000}秒`
                         }} editable={true} renderEdit={item => {
                    return <Select defaultValue={item.schedule0_sample_period} size={"small"} onChange={v => {
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
                <Setting device={device} name={"speed_object"} value={sensors.speed_object} title={"波速"} editable={true}
                         renderEdit={item => {
                             return <Input size={"small"} type={"number"} value={item.speed_object}/>
                         }} onSuccess={onRefreshSetting}/>
            </Col>
        </Row>
        {
            renderSensorSettings()
        }
    </Card>
}

export default SensorSetting