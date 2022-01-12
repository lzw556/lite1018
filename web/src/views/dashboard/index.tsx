import {Col, Row, Statistic, Typography} from "antd";
import EChartsReact from "echarts-for-react";
import ShadowCard from "../../components/shadowCard";
import {DefaultPieOption} from "../../constants/chart";
import {DashboardLayout} from "../layout";
import "./index.css";
import {useEffect, useState} from "react";
import {AssetStatistic} from "../../types/asset_statistic";
import {ColorDanger, ColorHealth, ColorInfo, ColorWarn} from "../../constants/color";
import {DeviceStatistic} from "../../types/device_statistic";
import {GetAlarmRecordStatisticsRequest} from "../../apis/alarm";
import {AlarmRecordStatistics} from "../../types/alarm_statistics";
import moment from "moment";
import AssetDashboardCard from "./assetDashboardCard";
import AlertChartCard from "./alertChartCard";
import {GetAllAssetStatisticsRequest} from "../../apis/asset";

const {Title} = Typography;

const DashboardPage = () => {
    const [assetStatistics, setAssetStatistics] = useState<AssetStatistic[]>([]);
    const [deviceStatistics, setDeviceStatistics] = useState<DeviceStatistic[]>([]);
    const [alarmStatistics, setAlarmStatistics] = useState<AlarmRecordStatistics>();

    const fetchAssetStatistics = () => {
        GetAllAssetStatisticsRequest().then(setAssetStatistics)
    }

    const renderAssetStatistics = () => {
        const total = assetStatistics.length
        const normal = assetStatistics.filter(item => item.status === 0).length
        const legend = new Map<string, number>([
            ['正常', normal],
            ['异常', total - normal],
        ]);
        const options = {
            ...DefaultPieOption,
            legend: {
                show: true,
                orient: 'vertical',
                left: 0,
                formatter: function (name: string) {
                    return `${name}(${legend.get(name)})`;
                },
            },
            series: [
                {
                    ...DefaultPieOption.series[0],
                    name: '资产状态',
                    radius: ['50%', '80%'],
                    center: ['70%', '45%'],
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
                },
            ]
        }
        return <Row justify={"start"}>
            <Col span={24}>
                <EChartsReact style={{height: "128px"}} option={options}/>
            </Col>
        </Row>
    }

    const fetchDeviceStatistics = () => {
        // GetDevicesStatisticsRequest().then(setDeviceStatistics);
    }

    const renderDeviceStatistics = () => {
        const total = deviceStatistics.length
        const info = deviceStatistics.filter(item => item.device.alertState?.level === 1).length
        const warn = deviceStatistics.filter(item => item.device.alertState?.level === 2).length
        const critical = deviceStatistics.filter(item => item.device.alertState?.level === 3).length
        const legend = new Map<string, number>([
            ['正常', total - info - warn - critical],
            ['提示', info],
            ['重要', warn],
            ['紧急', critical],
        ]);
        const options = {
            ...DefaultPieOption,
            legend: {
                show: true,
                orient: 'vertical',
                left: 0,
                formatter: function (name: string) {
                    return `${name}(${legend.get(name)})`;
                },
            },
            graphic: [],
            series: [
                {
                    ...DefaultPieOption.series[0],
                    radius: ['50%', '80%'],
                    center: ['70%', '45%'],
                    name: '设备状态',
                    data: [
                        {
                            value: total - info - warn - critical,
                            name: '正常',
                            itemStyle: {
                                color: ColorHealth
                            }
                        },
                        {
                            value: info,
                            name: '提示',
                            itemStyle: {
                                color: ColorInfo
                            },
                        },
                        {
                            value: warn,
                            name: '重要',
                            itemStyle: {
                                color: ColorWarn
                            }
                        },
                        {
                            value: critical,
                            name: '紧急',
                            itemStyle: {
                                color: ColorDanger
                            }
                        },
                    ]
                }
            ]
        }
        return <Row justify={"start"}>
            <Col span={24}>
                <EChartsReact style={{height: "128px"}} option={options}/>
            </Col>
        </Row>
    }

    const fetchAlarmStatistics = () => {
        GetAlarmRecordStatisticsRequest(moment().local().startOf("day").unix(), moment().local().endOf("day").unix(), {})
            .then(setAlarmStatistics)
    }

    const renderAlarmStatistics = () => {
        const untreated = alarmStatistics ? alarmStatistics.untreated.reduce((acc: number, cur: number) => acc + cur, 0) : 0
        const resolved = alarmStatistics ? alarmStatistics.resolved.reduce((acc: number, cur: number) => acc + cur, 0) : 0
        const recovered = alarmStatistics ? alarmStatistics.recovered.reduce((acc: number, cur: number) => acc + cur, 0) : 0
        const total = untreated + resolved + recovered
        return <>
            <Row justify={"center"} style={{textAlign: "center", height: "64px"}}>
                <Col span={12}>
                    <Statistic title={"总数"} value={total}/>
                </Col>
                <Col span={12}>
                    {/*<a href={`#/alarm-management/alarmRecords?status=0`}>*/}
                    <Statistic title={"未处理"} value={untreated}/>
                    {/*</a>*/}
                </Col>
            </Row>
            <Row justify={"start"} style={{textAlign: "center", height: "64px"}}>
                <Col span={12}>
                    <Statistic title={"已恢复"} value={recovered}/>
                </Col>
                <Col span={12}>
                    <Statistic title={"已处理"} value={resolved}/>
                </Col>
            </Row>
        </>
    }

    useEffect(() => {
        fetchAssetStatistics()
        fetchDeviceStatistics()
        fetchAlarmStatistics()
    }, [])

    return <DashboardLayout>
        <Row justify={"start"} style={{position: "relative", height: "256x", width: "100%"}}>
            <Col span={18}>
                <Row justify={"space-between"}>
                    <Col span={8}>
                        <ShadowCard style={{margin: 4}}>
                            <Title level={4}>资产统计</Title>
                            {
                                renderAssetStatistics()
                            }
                        </ShadowCard>
                    </Col>
                    <Col span={8}>
                        <ShadowCard style={{margin: 4}}>
                            <Title level={4}>设备统计</Title>
                            {
                                renderDeviceStatistics()
                            }
                        </ShadowCard>
                    </Col>
                    <Col span={8}>
                        <ShadowCard style={{margin: 4}}>
                            <Title level={4}>今日报警统计</Title>
                            {
                                renderAlarmStatistics()
                            }
                        </ShadowCard>
                    </Col>
                </Row>
                <Row justify={"start"}>
                    <Col span={24}>
                        <AssetDashboardCard values={assetStatistics}/>
                    </Col>
                </Row>
            </Col>
            <Col span={6}>
                <Row justify={"start"}>
                    <Col span={24}>
                        <AlertChartCard/>
                    </Col>
                </Row>
                <Row justify={"start"}>
                    <Col span={24}>
                        {/*<AlarmRecordCard/>*/}
                    </Col>
                </Row>
            </Col>
        </Row>
    </DashboardLayout>
}

export default DashboardPage