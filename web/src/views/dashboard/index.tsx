import {Col, Row, Statistic, Typography} from "antd";
import EChartsReact from "echarts-for-react";
import ShadowCard from "../../components/shadowCard";
import {DefaultPieOption} from "../../constants/chart";
import {DashboardLayout} from "../layout";
import "./index.css";
import {useEffect, useState} from "react";
import {GetAssetsStatisticsRequest} from "../../apis/asset";
import {AssetStatistic} from "../../types/asset_statistic";
import {ColorDanger, ColorHealth, ColorInfo, ColorWarn} from "../../constants/color";
import {DeviceStatistic} from "../../types/device_statistic";
import {GetDevicesStatisticsRequest} from "../../apis/device";
import {GetAlarmStatisticsRequest} from "../../apis/alarm";
import moment from "moment/moment";
import {AlarmStatistics} from "../../types/alarm_statistics";
import AssetStatistics from "./statistic/asset";
import AlertStatistics from "./statistic/alert";
import AlarmRecord from "./statistic/alarm_record";

const {Title, Text} = Typography;

const DashboardPage = () => {
    const [assetStatistics, setAssetStatistics] = useState<AssetStatistic[]>([]);
    const [deviceStatistics, setDeviceStatistics] = useState<DeviceStatistic[]>([]);
    const [alarmStatistics, setAlarmStatistics] = useState<AlarmStatistics>();

    const fetchAssetStatistics = async () => {
        const res = await GetAssetsStatisticsRequest();
        if (res.code === 200) {
            setAssetStatistics(res.data)
        }
    }

    const renderAssetStatistics = () => {
        const total = assetStatistics.length
        const normal = assetStatistics.filter(item => item.status === 0).length
        const options = {
            ...DefaultPieOption,
            series: [
                {
                    ...DefaultPieOption.series[0],
                    name: '资产状态',
                    data: [
                        {
                            value: normal,
                            name: '正常',
                            itemStyle: {
                                color: ColorHealth
                            },
                        },
                        {
                            value: total - normal,
                            name: '异常',
                            itemStyle: {
                                color: ColorDanger
                            },
                        }
                    ],
                    label: {
                        show: true,
                        formatter: '{d}%',
                        position: 'outside',
                        alignTo: 'labelLine',
                        bleedMargin: 5,
                    },
                    labelLine: {
                        show: true,
                        length: 8,
                        length2: 20,
                    },
                    startAngle: 60,
                }
            ]
        }
        return <Row>
            <Col span={8}>
                <br/>
                <Text type={"secondary"}>{`总数: ${total}`}</Text><br/>
                <Text type={"secondary"}>{`正常: ${normal}`}</Text><br/>
                <Text type={"secondary"}>{`异常: ${total - normal}`}</Text>
            </Col>
            <Col span={16}>
                <EChartsReact style={{height: "128px"}} option={options}/>
            </Col>
        </Row>
    }

    const fetchDeviceStatistics = async () => {
        const res = await GetDevicesStatisticsRequest();
        if (res.code === 200) {
            setDeviceStatistics(res.data)
        }
    }

    const renderDeviceStatistics = () => {
        const total = deviceStatistics.length
        const online = deviceStatistics.filter(item => item.status === 1).length
        const options = {
            ...DefaultPieOption,
            graphic: [
                {
                    type: 'text',
                    left: 'center',
                    top: '35%',
                    style: {
                        text: `在线率`,
                    }
                }
            ],
            series: [
                {
                    ...DefaultPieOption.series[0],
                    name: '设备状态',
                    data: [
                        {
                            value: online,
                            name: '在线',
                            itemStyle: {
                                color: ColorHealth
                            },
                            label: {
                                show: true,
                                formatter: `{d}%`,
                                position: 'outer',
                            }
                        },
                        {
                            value: total - online,
                            name: '离线',
                            itemStyle: {
                                color: ColorWarn
                            }
                        },
                    ],
                    label: {
                        show: true,
                        formatter: '{d}%',
                        position: 'outside',
                        alignTo: 'labelLine',
                        bleedMargin: 5,
                    },
                    labelLine: {
                        show: true,
                        length: 8,
                        length2: 20,
                    },
                    startAngle: 60,
                }
            ]
        }
        return <Row justify={"start"}>
            <Col span={8}>
                <br/>
                <Text type={"secondary"}>{`总数: ${total}`}</Text><br/>
                <Text type={"secondary"}>{`在线: ${online}`}</Text><br/>
                <Text type={"secondary"}>{`离线: ${total - online}`}</Text>
            </Col>
            <Col span={16}>
                <EChartsReact style={{height: "128px"}} option={options}/>
            </Col>
        </Row>
    }

    const fetchAlarmStatistics = async () => {
        const res = await GetAlarmStatisticsRequest(moment().startOf("day").utc().unix(), moment().endOf("day").utc().unix(), {});
        if (res.code === 200) {
            setAlarmStatistics(res.data)
        }
    }

    const renderAlarmStatistics = () => {
        const info = alarmStatistics ? alarmStatistics.info.reduce((acc: number, cur: number) => acc + cur, 0) : 0
        const warning = alarmStatistics ? alarmStatistics.warn.reduce((acc: number, cur: number) => acc + cur, 0) : 0
        const critical = alarmStatistics ? alarmStatistics.critical.reduce((acc: number, cur: number) => acc + cur, 0) : 0
        return <>
            <Row justify={"center"} style={{textAlign: "center", height: "64px"}}>
                <Col span={12}>
                    <Statistic title={"总数"} value={info + warning + critical}/>
                </Col>
                <Col span={12}>
                    <Statistic title={"紧急"} valueStyle={{color: ColorDanger, fontWeight: "bold"}} value={critical}/>
                </Col>
            </Row>
            <Row justify={"start"} style={{textAlign: "center", height: "64px"}}>
                <Col span={12}>
                    <Statistic title={"重要"} valueStyle={{color: ColorWarn, fontWeight: "bold"}} value={warning}/>
                </Col>
                <Col span={12}>
                    <Statistic title={"提示"} valueStyle={{color: ColorInfo, fontWeight: "bold"}} value={info}/>
                </Col>
            </Row>
        </>
    }

    useEffect(() => {
        fetchAssetStatistics().then()
        fetchDeviceStatistics().then()
        fetchAlarmStatistics().then()
    }, [])

    return <DashboardLayout>
        <Row justify={"start"} style={{position: "relative", height: "256x", width: "100%"}}>
            <Col span={18}>
                <Row justify={"space-between"}>
                    <Col span={8}>
                        <ShadowCard hoverable={true} style={{margin: 4}}>
                            <Title level={4}>资产统计</Title>
                            {
                                renderAssetStatistics()
                            }
                        </ShadowCard>
                    </Col>
                    <Col span={8}>
                        <ShadowCard hoverable={true} style={{margin: 4}}>
                            <Title level={4}>设备统计</Title>
                            {
                                renderDeviceStatistics()
                            }
                        </ShadowCard>
                    </Col>
                    <Col span={8}>
                        <ShadowCard hoverable={true} style={{margin: 4}}>
                            <Title level={4}>今日报警统计</Title>
                            {
                                renderAlarmStatistics()
                            }
                        </ShadowCard>
                    </Col>
                </Row>
                <Row justify={"start"}>
                    <Col span={24}>
                        <AssetStatistics values={assetStatistics}/>
                    </Col>
                </Row>
            </Col>
            <Col span={6}>
                <Row justify={"start"}>
                    <Col span={24}>
                        <AlertStatistics />
                    </Col>
                </Row>
                <Row justify={"start"}>
                    <Col span={24}>
                        <AlarmRecord />
                    </Col>
                </Row>
            </Col>
        </Row>
    </DashboardLayout>
}

export default DashboardPage