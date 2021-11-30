import {Device} from "../../../../types/device";
import {FC, useEffect, useState} from "react";
import {Button, Card, Col, DatePicker, Empty, Row, Select, Space} from "antd";
import {DeviceType, GetSensors} from "../../../../types/device_type";
import {GetChildrenRequest, GetDeviceDataRequest} from "../../../../apis/device";
import moment from "moment";
import {DefaultMonitorDataOption, LineChartStyles} from "../../../../constants/chart";
import ReactECharts from "echarts-for-react";
import {ColorDanger} from "../../../../constants/color";
import {AlarmRule} from "../../../../types/alarm_rule";
import Label from "../../../../components/label";
import {ReloadOutlined} from "@ant-design/icons";
import {GetFieldName} from "../../../../constants/field";

export interface MonitorPageProps {
    device?: Device
}

const {Option} = Select
const {RangePicker} = DatePicker

const MonitorPage: FC<MonitorPageProps> = ({device}) => {
    const [startDate, setStartDate] = useState<moment.Moment>(moment().startOf('day').subtract(7, 'd'))
    const [endDate, setEndDate] = useState<moment.Moment>(moment().endOf('day'))
    const [devices, setDevices] = useState<Device[]>()
    const [options, setOptions] = useState<any>([])
    const [selectedDevice, setSelectedDevice] = useState<number>(0)

    useEffect(() => {
        if (device) {
            if (device.typeId === DeviceType.Gateway || device.typeId === DeviceType.Router) {
                GetChildrenRequest(device.id).then(res => {
                    if (res.code === 200) {
                        const result = res.data.filter(item => GetSensors().includes(item.typeId))
                        setDevices(result)
                        if (result.length > 0) {
                            fetchDeviceData(result[0].id)
                        }
                    }
                })
            } else {
                fetchDeviceData(device.id)
            }
        }
    }, [device, startDate, endDate])

    const convertMarkLine = (alarms: AlarmRule[], unit: string) => {
        if (alarms) {
            const data = alarms.filter(item => item.level === 3).map(item => {
                return {
                    name: GetFieldName(item.rule.field),
                    yAxis: item.rule.threshold,
                    lineStyle: {color: ColorDanger},
                    tooltip: {formatter: `紧急<br/>{b} ${item.rule.operation} {c} ${unit}`},
                }
            })
            return {
                silent: false,
                symbol: "none",
                data: data,
                label: {position: 'insideEndTop', formatter: `阈值 {c}${unit}`}
            }
        }
    }

    const onDeviceChanged = (id: number) => {
        fetchDeviceData(id)
    }

    const fetchDeviceData = (id: number) => {
        setSelectedDevice(id)
        GetDeviceDataRequest(id, 0, startDate.utc().unix(), endDate.utc().unix()).then(res => {
            setOptions([])
            if (res.code === 200 && Array.isArray(res.data)) {
                setOptions(res.data.map(item => {
                    const series = Object.keys(item.fields).map((key, index) => {
                        return {
                            ...LineChartStyles[index],
                            name: GetFieldName(key),
                            type: 'line',
                            data: item.fields[key].map((value:any) => Number(value).toFixed(3)),
                            markLine: convertMarkLine(item.alarms, item.unit)
                        }
                    })
                    const xAxis = [{
                        type: 'category',
                        boundaryGap: false,
                        data: item.time.map(item => moment.unix(item).local().format("YYYY-MM-DD HH:mm:ss"))
                    }]
                    return Object.assign({}, DefaultMonitorDataOption, {
                        title: {text: item.name, textStyle: {fontSize: 14}},
                        tooltip: {
                            trigger: 'axis',
                            formatter: function (params: any) {
                                let relVal = params[0].name;
                                for (let i = 0; i < params.length; i++) {
                                    let value = Number(params[i].value).toFixed(3)
                                    relVal += `<br/> ${params[i].marker} ${params[i].seriesName}: ${value}${item.unit}`
                                }
                                return relVal;
                            }
                        },
                        xAxis: xAxis,
                        series: series
                    })
                }))
            }
        })
    }

    const renderDeviceSelect = () => {
        if (device){
            if (device.typeId === DeviceType.Gateway || device.typeId === DeviceType.Router) {
                return <Label name={"设备"}>
                    <Select style={{width:"128px"}} bordered={false} defaultActiveFirstOption={true}
                            defaultValue={devices?.length ? devices[0].id : undefined} onChange={onDeviceChanged}>
                        {
                            devices?.map(item => (<Option key={item.id} value={item.id}>{item.name}</Option>))
                        }
                    </Select>
                </Label>
            }
        }
    }

    const onReload = () => {
        if (selectedDevice) {
            setOptions([])
            fetchDeviceData(selectedDevice)
        }
    }

    const renderPropertyDataItems = () => {
        if (options && options.length) {
            return options.map((item: any, index: number) => {
                return <Card.Grid key={index} style={{boxShadow: "none", border: "none"}}>
                    <ReactECharts option={item} style={{border: "none"}}/>
                </Card.Grid>
            })
        }
        return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={"数据不足"}/>
    }

    const renderMonitorPage = () => {
        if (selectedDevice) {
            return <div>
                <Row justify={"end"} style={{textAlign: "center"}}>
                    <Col>
                        <Space>
                            {
                                renderDeviceSelect()
                            }
                            <RangePicker
                                value={[startDate, endDate]}
                                onChange={(date, dateString) => {
                                    if (dateString) {
                                        setStartDate(moment(dateString[0]).startOf('day'))
                                        setEndDate(moment(dateString[1]).endOf('day'))
                                    }
                                }}/>
                            <Button icon={<ReloadOutlined />} onClick={onReload}/>
                        </Space>
                    </Col>
                </Row>
                <Row justify={"start"} style={{paddingTop: "4px"}}>
                    <Col span={24}>
                        <Card bordered={false}>
                            {
                                renderPropertyDataItems()
                            }
                        </Card>
                    </Col>
                </Row>
            </div>
        }
        return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={"数据不足"}/>
    }

    return renderMonitorPage()
}

export default MonitorPage