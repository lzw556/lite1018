import {Card, Col, Drawer, DrawerProps, Empty, Row, Table, Tag, Typography} from "antd";
import {Device} from "../../types/device";
import {FC, useEffect, useState} from "react";
import ReactECharts from "echarts-for-react";
import {GetDeviceDataRequest, GetDeviceRuntimeDataRequest, GetLastDeviceDataRequest} from "../../apis/device";
import {DefaultMonitorDataOption, LineChartStyles} from "../../constants/chart";
import moment from "moment";

export interface DeviceMonitorDrawerProps extends DrawerProps {
    device: Device;
}

const DeviceMonitorDrawer: FC<DeviceMonitorDrawerProps> = (props) => {
    const {device, visible} = props;
    const [historyOptions, setHistoryOptions] = useState<any>();
    const [runtimeOptions, setRuntimeOptions] = useState<any>();
    const [deviceData, setDeviceData] = useState<any>()
    const [startDate] = useState<moment.Moment>(moment().startOf('day').subtract(13, 'd'));
    const [endDate] = useState<moment.Moment>(moment().endOf('day'));
    const [height] = useState<number>(window.innerHeight);

    useEffect(() => {
        if (visible) {
            fetchDeviceHistoryData();
            fetchDeviceRuntimeData();
            fetchLastDeviceData();
        }
    }, [visible]);

    const fetchDeviceRuntimeData = () => {
        GetDeviceRuntimeDataRequest(device.id, startDate.utc().unix(), endDate.utc().unix()).then(data => {
            const batteryOption = {
                ...DefaultMonitorDataOption,
                title: {text: "电池电压"},
                tooltip: {
                    trigger: "axis",
                    formatter: "{b}<br/>{a}: {c}mV"
                },
                series: [{
                    ...LineChartStyles[0],
                    name: "电池电压",
                    type: "line",
                    data: data.map((item:any) => item.batteryVoltage)
                }],
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: data.map((item:any) => moment.unix(item.timestamp).local().format("YYYY-MM-DD HH:mm:ss"))
                }
            }
            const signalOption = {
                ...DefaultMonitorDataOption,
                title: {text: "信号强度"},
                tooltip: {
                    trigger: "axis",
                    formatter: "{b}<br/>{a}: {c}dB"
                },
                series: [{
                    ...LineChartStyles[0],
                    name: "信号强度",
                    type: "line",
                    data: data.map((item:any) => item.signalStrength)
                }],
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: data.map((item:any) => moment.unix(item.timestamp).local().format("YYYY-MM-DD HH:mm:ss"))
                }
            }
            setRuntimeOptions([batteryOption, signalOption])
        })
    }

    const fetchDeviceHistoryData = () => {
        GetDeviceDataRequest(device.id, startDate.utc().unix(), endDate.utc().unix()).then(data => {
            setHistoryOptions(device.properties.map(property => {
                const fields = new Map<string, number[]>()
                const times: any[] = []
                data.map((item: any) => {
                    return {
                        time: moment.unix(item.timestamp).local(),
                        property: item.properties.find((item: any) => item.key === property.key)
                    }
                }).forEach((item: any) => {
                    times.push(item.time)
                    Object.keys(item.property.data).forEach(key => {
                        if (!fields.has(key)) {
                            fields.set(key, [item.property.data[key]])
                        } else {
                            fields.get(key)?.push(item.property.data[key])
                        }
                    })
                })
                const series: any[] = []
                Array.from(fields.keys()).forEach((key, index) => {
                    series.push({
                        ...LineChartStyles[index],
                        name: key,
                        type: 'line',
                        data: fields.get(key)
                    })
                })
                return {
                    ...DefaultMonitorDataOption,
                    tooltip: {
                        trigger: 'axis',
                        formatter: function (params: any) {
                            let relVal = params[0].name;
                            for (let i = 0; i < params.length; i++) {
                                let value = Number(params[i].value).toFixed(3)
                                relVal += `<br/> ${params[i].marker} ${params[i].seriesName}: ${value}${property.unit}`;
                            }
                            return relVal;
                        }
                    },
                    title: {text: property.name},
                    series,
                    xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data: times.map((item: any) => item.format("YYYY-MM-DD HH:mm:ss"))
                    }
                }
            }))
        })
    }

    const fetchLastDeviceData = () => {
        GetLastDeviceDataRequest(device.id).then(setDeviceData)
    }

    const renderDeviceHistoryDataChart = () => {
        if (historyOptions && historyOptions.length) {
            return historyOptions.map((item: any, index: number) => {
                return <Card.Grid key={index} style={{boxShadow: "none", border: "none", width: "25%"}}>
                    <ReactECharts option={item} style={{border: "none", height: "256px"}}/>
                </Card.Grid>
            })
        }
        return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={"数据不足"}/>
    }

    const renderDeviceRuntimeDataChart = () => {
        if (runtimeOptions && runtimeOptions.length) {
            return runtimeOptions.map((item: any, index: number) => {
                return <Card.Grid key={index} style={{boxShadow: "none", border: "none", width: "50%"}}>
                    <ReactECharts option={item} style={{border: "none", height: "256px"}}/>
                </Card.Grid>
            })
        }
        return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={"数据不足"}/>
    }

    const columns = [
        {
            title: '名称',
            dataIndex: 'name',
            key: 'name',
            width: '20%',
        },
        {
            title: '值',
            dataIndex: 'data',
            key: 'data',
            render: (data:any, property:any) => {
                return Object.keys(data).map(key => {
                    return <Tag>{key}:{data[key].toFixed(property.precision)}{property.unit}</Tag>
                })
            }
        }
    ]

    return <Drawer {...props} placement={"top"} closable={false} height={height - 100}>
        <Row justify={"start"}>
            <Col span={24}>
                <Typography.Title level={4}>设备监控: {device.name}</Typography.Title>
                <Typography.Text>提示: 当前窗口显示14天内的监控数据, 按<Typography.Text keyboard>ESC</Typography.Text>可以退出此窗口</Typography.Text>
            </Col>
        </Row>
        <br/>
        <Row justify={"start"}>
            <Col span={12}>
                <Typography.Title level={4}>运行状态</Typography.Title>
                <Card bordered={false}>
                    {
                        renderDeviceRuntimeDataChart()
                    }
                </Card>
            </Col>
            <Col span={12}>
                <Typography.Title level={4}>当前特征值数据</Typography.Title>
                {
                    deviceData &&
                    <Typography.Text>最近一次采集时间: {moment.unix(deviceData.timestamp).local().format("YYYY-MM-DD HH:mm:ss")}</Typography.Text>
                }
                <Table columns={columns} size={"small"} scroll={{y: 300}} dataSource={deviceData?.properties} pagination={false}/>
            </Col>
        </Row>
        <Row justify={"start"}>
            <Col span={24}>
                <Typography.Title level={4}>历史数据</Typography.Title>
                <Card bordered={false}>
                    {
                        renderDeviceHistoryDataChart()
                    }
                </Card>
            </Col>
        </Row>
    </Drawer>
}

export default DeviceMonitorDrawer;
