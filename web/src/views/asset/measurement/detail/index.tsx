import {Content} from "antd/es/layout/layout";
import MyBreadcrumb from "../../../../components/myBreadcrumb";
import {useEffect, useState} from "react";
import {GetParamValue} from "../../../../utils/path";
import {useLocation} from "react-router-dom";
import {
    GetMeasurementFieldsRequest,
    GetMeasurementRequest,
    GetMeasurementStatisticRequest,
} from "../../../../apis/measurement";
import {Measurement} from "../../../../types/measurement";
import {Col, Form, Row, Statistic, Tag, Typography} from "antd";
import ShadowCard from "../../../../components/shadowCard";
import {ColorDanger, ColorHealth, ColorInfo, ColorWarn} from "../../../../constants/color";
import {MeasurementType} from "../../../../types/measurement_type";
import "../../index.css";
import moment from "moment";
import SensorStatistic from "../../monitor/sensorStatistic";
import AlertStatistic from "./alertStatistic";
import SensorTable from "./sensorTable";
import MeasurementSettings from "./settings";
import HistoryData from "./history";
import {MeasurementField} from "../../../../types/measurement_data";

const tabList = [
    {
        key: "sensors",
        tab: "传感器列表"
    },
    {
        key: "history",
        tab: "历史数据"
    },
    {
        key: "settings",
        tab: "参数配置"
    }
]

const MeasurementDetail = () => {
    const location = useLocation();
    const [measurement, setMeasurement] = useState<Measurement>();
    const [statistic, setStatistic] = useState<any>()
    const [currentKey, setCurrentKey] = useState("sensors")
    const [fields, setFields] = useState<MeasurementField[]>([])
    const contents = new Map<string, any>([
        ["sensors", measurement && <SensorTable measurement={measurement}/>],
        ["history", measurement && <HistoryData measurement={measurement}/>],
        ["settings", measurement && <MeasurementSettings measurement={measurement}/>]
    ]);

    useEffect(() => {
        const id = GetParamValue(location.search, "id")
        if (id && Number(id)) {
            GetMeasurementRequest(Number(id)).then(setMeasurement)
            GetMeasurementStatisticRequest(Number(id)).then(setStatistic)
        }
    }, [])

    useEffect(() => {
        if (measurement) {
            GetMeasurementFieldsRequest(measurement.type).then(setFields)
        }
    }, [measurement])

    const renderActions = () => {
        switch (measurement?.type) {
            case MeasurementType.BoltLoosening:
                return fields.sort((a, b) => Number(b.primary) - Number(a.primary)).map(field => {
                    if (measurement?.data?.fields) {
                        const data = measurement.data?.fields.find(f => f.name === field.name)
                        if (data) {
                            return <Statistic title={data.title} valueStyle={{fontSize: "14pt"}}
                                              value={data.value.toFixed(data.precision)} suffix={data.unit}/>
                        }
                    }
                    return <Statistic title={field.title} valueStyle={{fontSize: "14pt"}}
                                      value={"暂无数据"}/>
                })
        }
        return []
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

    return <Content>
        <MyBreadcrumb/>
        {
            measurement && <Row justify={"space-between"}>
                <Col span={12} style={{height: "100%"}}>
                    <ShadowCard style={{height: "100%"}} size={"small"} actions={renderActions()}>
                        <Typography.Title level={4}>{measurement.name}</Typography.Title>
                        <Form.Item label={"状态"} style={{marginBottom: "4px"}} labelCol={{span: 5}} labelAlign={"left"}
                                   colon={false}>
                            {
                                renderStatus()
                            }
                        </Form.Item>
                        <Form.Item label={"类型"} style={{marginBottom: "4px"}} labelCol={{span: 5}} labelAlign={"left"}
                                   colon={false}>
                            {
                                MeasurementType.toString(measurement.type)
                            }
                        </Form.Item>
                        <Form.Item label={"上报时间"} style={{marginBottom: "2px"}} labelCol={{span: 5}} labelAlign={"left"}
                                   colon={false}>
                            {
                                measurement.data ? moment.unix(measurement.data?.timestamp).local().format("YYYY-MM-DD HH:mm:ss") : "-"
                            }
                        </Form.Item>
                    </ShadowCard>
                </Col>
                <Col span={12}>
                    <Row justify={"start"}>
                        <Col span={12} style={{paddingLeft: "8px"}}>
                            <ShadowCard>
                                <Statistic title={"总数据条数"} value={statistic?.data.total}/>
                            </ShadowCard>
                        </Col>
                        <Col span={12} style={{paddingLeft: "8px"}}>
                            <ShadowCard>
                                <Statistic title={"今日数据条数"} value={statistic?.data.today}/>
                            </ShadowCard>
                        </Col>
                    </Row>
                    <Row justify={"start"} style={{paddingTop: "8px"}}>
                        <Col span={8} style={{paddingLeft: "8px"}}>
                            <ShadowCard>
                                <Statistic title={"总报警"} value={statistic?.alert.total}/>
                            </ShadowCard>
                        </Col>
                        <Col span={8} style={{paddingLeft: "8px"}}>
                            <ShadowCard>
                                <Statistic title={"今日报警"} value={statistic?.alert.today}/>
                            </ShadowCard>
                        </Col>
                        <Col span={8} style={{paddingLeft: "8px"}}>
                            <ShadowCard>
                                <Statistic title={"未处理报警"} value={statistic?.alert.untreated}/>
                            </ShadowCard>
                        </Col>
                    </Row>
                </Col>
            </Row>
        }
        <Row justify={"start"} style={{paddingTop: "8px", paddingBottom: "8px"}}>
            <Col span={10}>
                <ShadowCard title={"传感器统计"}>
                    {
                        measurement &&
                        <SensorStatistic filter={{measurement_id: measurement.id}} style={{height: "200px"}}/>
                    }
                </ShadowCard>
            </Col>
            <Col span={14}>
                <ShadowCard title={"一周报警统计"} style={{marginLeft: "8px"}}>
                    {
                        measurement &&
                        <AlertStatistic filter={{measurement_id: measurement.id}} style={{height: "200px"}}/>
                    }
                </ShadowCard>
            </Col>
        </Row>
        <Row justify={"start"} style={{paddingBottom: "8px"}}>
            <Col span={24}>
                <ShadowCard tabList={tabList} onTabChange={key => setCurrentKey(key)}>
                    {contents.get(currentKey)}
                </ShadowCard>
            </Col>
        </Row>
    </Content>;
};

export default MeasurementDetail;