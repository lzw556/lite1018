import {Card, Carousel, Col, List, Row, Select, Skeleton, Statistic, Tag, Typography} from "antd";
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
import {Device} from "../../types/device";
import {LeftOutlined, RightOutlined} from "@ant-design/icons";
import InfiniteScroll from "react-infinite-scroll-component";
import {GetPrimaryProperty} from "../../types/property";
import {GetFieldName} from "../../constants/field";

const {Title, Text} = Typography;

const DashboardPage = () => {
    const [height] = useState<number>(window.innerHeight)
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

    const renderDeviceCard = (device: Device) => {
        const property = GetPrimaryProperty(device.properties, device.typeId)
        if (property) {
            if (property.data && Object.keys(property.data.fields).length) {
                const field = Object.keys(property.data.fields)[0]
                return <Statistic title={GetFieldName(field)} valueStyle={{color: device.alertState === 3 ? ColorDanger : ColorHealth}} value={Number(property.data.fields[field]).toFixed(3)} suffix={property.unit}/>
            }else {
                return <Statistic title={property.name} value={"暂无数据"}/>
            }

        }
        return <Statistic title={"未知属性"} value={"暂无数据"}/>
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
            </Col>
            <Col span={6}>
            </Col>
        </Row>
        <Row justify={"start"}>
            <Col span={18}>
                <ShadowCard style={{position: "relative", height: `${height - 294}px`, margin: 4}}>
                    <Carousel prevArrow={<LeftOutlined/>} nextArrow={<RightOutlined/>}
                              arrows={true} dotPosition={"bottom"} dots={{className: "ts-carousel-color"}}
                              style={{position: "relative", height: `${height - 330}px`, width: "100%"}}>
                        {
                            assetStatistics && assetStatistics.map((item: any, index: number) => {
                                const total = item.devices.length
                                const online = item.devices.filter((device: Device) => device?.state.isOnline).length
                                const alert = item.devices.filter((device: Device) => device?.alertState === 3).length
                                const noAccess = item.devices.filter((device: Device) => device?.accessState === 0).length
                                return <div key={index}>
                                    <Row justify={"start"} style={{textAlign: "center"}}>
                                        <Col span={6}>
                                            <Statistic title={"资产名称"} value={item.asset.name} valueStyle={{
                                                color: `${item.status ? ColorDanger : ColorHealth}`,
                                                fontWeight: "bold"
                                            }}/>
                                        </Col>
                                        <Col span={4}>
                                            <Statistic title={"设备总数"} value={total}/>
                                        </Col>
                                        <Col span={4}>
                                            <Statistic title={"在线设备数"} value={online} valueStyle={{color: ColorHealth}}
                                                       suffix={`/ ${total}`}/>
                                        </Col>
                                        <Col span={4}>
                                            <Statistic title={"报警设备数"} value={alert} valueStyle={{color: ColorDanger}}
                                                       suffix={`/ ${total}`}/>
                                        </Col>
                                        <Col span={4}>
                                            <Statistic title={"未入网设备"} value={noAccess} valueStyle={{color: ColorWarn}}
                                                       suffix={`/ ${total}`}/>
                                        </Col>
                                    </Row>
                                    <Row justify={"start"} style={{paddingTop: "4px"}}>
                                        <Col span={21} offset={1}>
                                            <div
                                                id="scrollableDiv"
                                                style={{
                                                    height: `${height - 440}px`,
                                                    overflow: 'auto',
                                                    padding: '8px',
                                                    border: '0px solid rgba(140, 140, 140, 0.35)',
                                                }}
                                            >
                                                <InfiniteScroll
                                                    dataLength={item.devices.length}
                                                    hasMore={false}
                                                    loader={<Skeleton paragraph={{rows: 1}} active/>}
                                                    scrollableTarget="scrollableDiv"
                                                    style={{paddingTop: "8px"}}
                                                    next={() => {
                                                    }}>
                                                    <List size={"small"} dataSource={item.devices}
                                                          grid={{column: 4 }}
                                                          renderItem={(device: Device) => {
                                                              return <List.Item key={device.id}>
                                                                  <ShadowCard bordered={false} hoverable={true} size={"small"}>
                                                                      <Card.Meta avatar={() => {
                                                                          return device.state.isOnline ?
                                                                              <Tag color={ColorHealth}>在线</Tag> :
                                                                              <Tag color={ColorWarn}>离线</Tag>
                                                                      }} title={device.name} description={""}/>
                                                                      {
                                                                          renderDeviceCard(device)
                                                                      }
                                                                  </ShadowCard>
                                                              </List.Item>
                                                          }}/>
                                                </InfiniteScroll>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            })
                        }
                    </Carousel>
                </ShadowCard>
            </Col>
        </Row>
    </DashboardLayout>
}

export default DashboardPage