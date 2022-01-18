import {Content} from "antd/es/layout/layout";
import MyBreadcrumb from "../../../../components/myBreadcrumb";
import {useEffect, useState} from "react";
import {GetParamValue} from "../../../../utils/path";
import {useLocation} from "react-router-dom";
import {
    GetMeasurementAlertStatisticRequest,
    GetMeasurementDataStatisticRequest,
    GetMeasurementFieldsRequest,
    GetMeasurementRequest,
} from "../../../../apis/measurement";
import {Measurement} from "../../../../types/measurement";
import {Col, Form, Popover, Row, Statistic, Tag, Typography} from "antd";
import ShadowCard from "../../../../components/shadowCard";
import {ColorDanger, ColorHealth, ColorInfo, ColorWarn} from "../../../../constants/color";
import {MeasurementType} from "../../../../types/measurement_type";
import "../../index.css";
import moment from "moment";
import SensorStatistic from "../../monitor/sensorStatistic";
import AlertStatistic from "./alertStatistic";
import SensorList from "./sensorList";
import MeasurementSettings from "./settings";
import HistoryData from "./history";
import {MeasurementField, MeasurementFieldType} from "../../../../types/measurement_data";
import WaveData from "./waveData";

const tabList = [
    {
        key: "sensors",
        tab: "传感器列表"
    },
    {
        key: "settings",
        tab: "参数配置"
    },
    {
        key: "history",
        tab: "历史数据"
    },
]

const MeasurementDetail = () => {
    const location = useLocation();
    const [measurement, setMeasurement] = useState<Measurement>();
    const [dataStatistic, setDataStatistic] = useState<any>()
    const [alertStatistic, setAlertStatistic] = useState<any>()
    const [currentKey, setCurrentKey] = useState("sensors")
    const [fields, setFields] = useState<MeasurementField[]>([])
    const contents = new Map<string, any>([
        ["sensors", measurement && <SensorList measurement={measurement}/>],
        ["history", measurement && <HistoryData measurement={measurement}/>],
        ["waveData", measurement && <WaveData measurement={measurement}/>],
        ["settings", measurement && <MeasurementSettings measurement={measurement}/>]
    ]);

    useEffect(() => {
        const id = GetParamValue(location.search, "id")
        if (id && Number(id)) {
            GetMeasurementRequest(Number(id)).then(setMeasurement)
            GetMeasurementDataStatisticRequest(Number(id)).then(setDataStatistic)
            GetMeasurementAlertStatisticRequest(Number(id)).then(setAlertStatistic)
        }
    }, [])

    useEffect(() => {
        if (measurement) {
            GetMeasurementFieldsRequest(measurement.type).then(setFields)
        }
    }, [measurement])

    const renderContent = (field: MeasurementField) => {
        switch (measurement?.type) {
            case MeasurementType.Vibration:
                return <>
                    <p>{`X轴: ${field.value[0].toFixed(field.precision)}${field.unit}`}</p>
                    <p>{`Y轴: ${field.value[1].toFixed(field.precision)}${field.unit}`}</p>
                    <p>{`Z轴: ${field.value[2].toFixed(field.precision)}${field.unit}`}</p>
                </>
        }
        return <div/>
    }

    const renderActions = () => {
        return fields.filter(item => item.primary).sort((a, b) => a.sort - b.sort).map(field => {
            if (measurement?.data?.fields) {
                const data = measurement.data?.fields.find(f => f.name === field.name)
                if (data) {
                    if (field.type === MeasurementFieldType.Float) {
                        return <Statistic title={data.title} valueStyle={{fontSize: "14pt"}}
                                          value={data.value.toFixed(data.precision)} suffix={data.unit}/>
                    } else if (field.type === MeasurementFieldType.Axis) {
                        return <Popover title={data.title} content={renderContent(data)}>
                            <Statistic title={data.title} valueStyle={{fontSize: "14pt"}}
                                       value={data.value[0].toFixed(data.precision)} suffix={data.unit}/>
                        </Popover>
                    } else {
                        return <>
                            <Statistic title={`${data.title}最小值`} valueStyle={{fontSize: "14pt"}}
                                       value={Math.min.apply(null, data.value).toFixed(data.precision)}/>
                        </>
                    }
                }
            }
            return <Statistic title={field.title} valueStyle={{fontSize: "14pt"}}
                              value={"暂无数据"}/>
        })
    }

    const renderStatus = () => {
        switch (measurement?.alert?.level) {
            case 1:
                return <Tag color={ColorInfo}>提示</Tag>
            case 2:
                return <Tag color={ColorWarn}>重要</Tag>
            case 3:
                return <Tag color={ColorDanger}>紧急</Tag>
            default:
                return <Tag color={ColorHealth}>正常</Tag>
        }
    }

    const renderTabList = () => {
        switch (measurement?.type) {
            case MeasurementType.Vibration:
                return [
                    ...tabList,
                    {
                        key: "waveData",
                        tab: "波形数据"
                    },
                ]
            default:
                return tabList
        }
    }

    return <Content>
        <MyBreadcrumb/>
        {
            measurement &&
            <ShadowCard actions={renderActions()}>
                <Row justify={"space-between"}>
                    <Col span={12} style={{height: "100%"}}>
                        <Typography.Title level={4}>{measurement.name}</Typography.Title>
                        <Form.Item label={"状态"} labelCol={{span: 5}}
                                   labelAlign={"left"}
                                   style={{marginBottom: "6px"}}
                                   colon={false}>
                            {
                                renderStatus()
                            }
                        </Form.Item>
                        <Form.Item label={"类型"} labelCol={{span: 5}}
                                   labelAlign={"left"}
                                   style={{marginBottom: "6px"}}
                                   colon={false}>
                            {
                                MeasurementType.toString(measurement.type)
                            }
                        </Form.Item>
                        <Form.Item label={"所属资产"} labelCol={{span: 5}}
                                   labelAlign={"left"}
                                   style={{marginBottom: "6px"}}
                                   colon={false}>
                            {
                                measurement.asset?.name
                            }
                        </Form.Item>
                        <Form.Item label={"采集时间"} labelCol={{span: 5}}
                                   labelAlign={"left"}
                                   style={{marginBottom: "6px"}}
                                   colon={false}>
                            {
                                measurement.data && measurement.data.timestamp > 0 ? moment.unix(measurement.data.timestamp).local().format("YYYY-MM-DD HH:mm:ss") : "-"
                            }
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Row justify={"start"}>
                            <Col span={12} style={{paddingLeft: "8px"}}>
                                <ShadowCard>
                                    <Statistic title={"总数据条数"} value={dataStatistic?.total}/>
                                </ShadowCard>
                            </Col>
                            <Col span={12} style={{paddingLeft: "8px"}}>
                                <ShadowCard>
                                    <Statistic title={"今日数据条数"} value={dataStatistic?.today}/>
                                </ShadowCard>
                            </Col>
                        </Row>
                        <Row justify={"start"} style={{paddingTop: "8px"}}>
                            <Col span={8} style={{paddingLeft: "8px"}}>
                                <ShadowCard>
                                    <Statistic title={"总报警"} value={alertStatistic?.total}/>
                                </ShadowCard>
                            </Col>
                            <Col span={8} style={{paddingLeft: "8px"}}>
                                <ShadowCard>
                                    <Statistic title={"今日报警"} value={alertStatistic?.today}/>
                                </ShadowCard>
                            </Col>
                            <Col span={8} style={{paddingLeft: "8px"}}>
                                <ShadowCard>
                                    <Statistic title={"未处理报警"} value={alertStatistic?.untreated}/>
                                </ShadowCard>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </ShadowCard>
        }
        <Row justify={"start"} style={{paddingTop: "8px", paddingBottom: "8px"}}>
            <Col xl={10} xxl={6}>
                <ShadowCard title={<Typography.Title level={5}>传感器统计</Typography.Title>}>
                    {
                        measurement &&
                        <SensorStatistic filter={{measurement_id: measurement.id}} style={{height: "200px"}}/>
                    }
                </ShadowCard>
            </Col>
            <Col xl={14} xxl={18}>
                <ShadowCard title={<Typography.Title level={5}>一周报警统计</Typography.Title>} style={{marginLeft: "8px"}}>
                    {
                        measurement &&
                        <AlertStatistic filter={{measurement_id: measurement.id}} style={{height: "200px"}}/>
                    }
                </ShadowCard>
            </Col>
        </Row>
        <Row justify={"start"} style={{paddingBottom: "8px"}}>
            <Col span={24}>
                <ShadowCard tabList={renderTabList()} onTabChange={key => setCurrentKey(key)}>
                    {contents.get(currentKey)}
                </ShadowCard>
            </Col>
        </Row>
    </Content>;
};

export default MeasurementDetail;