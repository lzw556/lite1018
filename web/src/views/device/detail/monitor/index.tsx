import {Device} from "../../../../types/device";
import {FC, useEffect, useState} from "react";
import {Button, Card, Col, DatePicker, Empty, Row, Select, Space} from "antd";
import {DeviceType} from "../../../../types/device_type";
import {GetChildrenRequest, GetDeviceDataRequest} from "../../../../apis/device";
import moment from "moment";
import {DefaultMonitorDataOption, LineChartStyles} from "../../../../constants/chart";
import ReactECharts from "echarts-for-react";
import Label from "../../../../components/label";
import {ReloadOutlined} from "@ant-design/icons";

export interface MonitorPageProps {
    device: Device
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
                GetChildrenRequest(device.id).then(data => {
                    const result = data.filter(item => DeviceType.Sensors().includes(item.typeId))
                    setDevices(result)
                    if (result.length > 0) {
                        fetchDeviceData(result[0].id)
                    }
                })
            } else {
                fetchDeviceData(device.id)
            }
        }
    }, [device, startDate, endDate])

    const onDeviceChanged = (id: number) => {
        fetchDeviceData(id)
    }

    const fetchDeviceData = (id: number) => {
        setSelectedDevice(id)
        GetDeviceDataRequest(id, startDate.utc().unix(), endDate.utc().unix()).then(data => {
            setOptions(device.properties.map(property => {
                const key = property.key
                let series: any[]
                let legends: string[]
                switch (property.type) {
                    case 'axis':
                        legends = ["X轴", "Y轴", "Z轴"]
                        series = legends.map((item, index) => {
                            return {
                                ...LineChartStyles[index],
                                name: item,
                                type: 'line',
                                data: data[key].map((item:any) => item.value[index]),
                                showSymbol: false
                            }
                        })
                        break;
                    default:
                        legends = [property.name]
                        series = [
                            {
                                ...LineChartStyles[0],
                                name: property.name,
                                type: 'line',
                                data: data[key].map((item:any) => item.value),
                                showSymbol: false
                            }
                        ]
                        break;
                }
                return {
                    ...DefaultMonitorDataOption,
                    tooltip: {
                        trigger: 'axis',
                        formatter: function (params: any) {
                            let relVal = params[0].name;
                            for (let i = 0; i < params.length; i++) {
                                let value = Number(params[i].value).toFixed(3)
                                relVal += `<br/> ${params[i].marker} ${params[i].seriesName}: ${value}${property.unit}`
                            }
                            return relVal;
                        }
                    },
                    title: {text: property.name},
                    series,
                    xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data: data[key].map((item:any) => moment.unix(item.timestamp).local().format("YYYY-MM-DD HH:mm:ss"))
                    }
                }
            }))
        })
    }

    const renderDeviceSelect = () => {
        if (device) {
            if (device.typeId === DeviceType.Gateway || device.typeId === DeviceType.Router) {
                return <Label name={"设备"}>
                    <Select style={{width: "128px"}} bordered={false} defaultActiveFirstOption={true}
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
                            <Button icon={<ReloadOutlined/>} onClick={onReload}/>
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