import {Device} from "../../../../types/device";
import {FC, useCallback, useEffect, useState} from "react";
import {GetDeviceRuntimeDataRequest} from "../../../../apis/device";
import moment from "moment/moment";
import {DefaultMonitorDataOption, LineChartStyles} from "../../../../constants/chart";
import {Button, Card, Col, DatePicker, Empty, Row, Select, Space} from "antd";
import {ReloadOutlined} from "@ant-design/icons";
import ReactECharts from "echarts-for-react";

export interface RuntimeDataProps {
    device: Device;
}

const {Option} = Select
const {RangePicker} = DatePicker

const RuntimeData:FC<RuntimeDataProps> = ({device}) => {
    const [startDate, setStartDate] = useState<moment.Moment>(moment().startOf('day').subtract(7, 'd'))
    const [endDate, setEndDate] = useState<moment.Moment>(moment().endOf('day'))
    const [options, setOptions] = useState<any[]>([])

    const fetchRuntimeData = useCallback(() => {
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
            setOptions([batteryOption, signalOption])
        })
    }, [startDate, endDate])


    useEffect(() => {
        fetchRuntimeData()
    }, [fetchRuntimeData])

    const renderCharts = () => {
        if (options && options.length) {
            return options.map((item: any, index: number) => {
                return <Card.Grid key={index} style={{boxShadow: "none", border: "none"}}>
                    <ReactECharts option={item} style={{border: "none"}}/>
                </Card.Grid>
            })
        }
        return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={"数据不足"}/>
    }

    return <div>
        <Row justify={"end"} style={{textAlign: "center"}}>
            <Col>
                <Space>
                    <RangePicker
                        value={[startDate, endDate]}
                        onChange={(date, dateString) => {
                            if (dateString) {
                                setStartDate(moment(dateString[0]).startOf('day'))
                                setEndDate(moment(dateString[1]).endOf('day'))
                            }
                        }}/>
                </Space>
            </Col>
        </Row>
        <Row justify={"start"} style={{paddingTop: "4px"}}>
            <Col span={24}>
                <Card bordered={false}>
                    {
                        renderCharts()
                    }
                </Card>
            </Col>
        </Row>
    </div>
}

export default RuntimeData;