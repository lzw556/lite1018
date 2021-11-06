import {Device} from "../../../../types/device";
import {FC, useCallback, useEffect, useState} from "react";
import {DeviceType} from "../../../../types/device_type";
import Label from "../../../../components/label";
import {Button, Col, DatePicker, Empty, Popconfirm, Row, Select, Space, Tag} from "antd";
import {GetChildrenRequest} from "../../../../apis/device";
import moment from "moment";
import {BarChartOutlined, DeleteOutlined} from "@ant-design/icons";
import {GetAlarmStatisticsRequest, PagingAlarmRecordsRequest} from "../../../../apis/alarm";
import TableLayout, {TableProps} from "../../../layout/TableLayout";
import {ColorDanger, ColorInfo, ColorWarn} from "../../../../constants/color";
import {
    AlarmLevelCritical,
    AlarmLevelInfo,
    AlarmLevelWarn,
    GetAlarmLevelString,
    OperationTranslate
} from "../../../../constants/rule";
import ReactECharts from "echarts-for-react";
import {DefaultMultiBarOption} from "../../../../constants/chart";
import {GetFieldName} from "../../../../constants/field";

export interface AlertPageProps {
    device?: Device
}

const {Option} = Select
const {RangePicker} = DatePicker

const AlertPage: FC<AlertPageProps> = ({device}) => {
    const [table, setTable] = useState<TableProps>({data: {}, isLoading: false, pagination: true, refreshKey: 0})
    const [devices, setDevices] = useState<Device[]>([])
    const [dateRange, setDateRange] = useState<moment.Moment[]>([moment().startOf('day').subtract(7, 'd'), moment().endOf('day')])
    const [selectedDevice, setSelectedDevice] = useState<number>(0)
    const [alarmLevels, setAlarmLevels] = useState<number[]>([1, 2, 3])
    const [chartVisible, setChartVisible] = useState<boolean>(true)
    const [option, setOption] = useState<any>(DefaultMultiBarOption)

    useEffect(() => {
        if (device) {
            if (device.typeId === DeviceType.Gateway || device.typeId === DeviceType.Router) {
                GetChildrenRequest(device.id).then(res => {
                    if (res.code === 200) {
                        setDevices(res.data)
                        if (res.data.length) {
                            setSelectedDevice(res.data[0].id)
                        }
                    }
                })
            } else {
                setSelectedDevice(device.id)
            }
        }
    }, [device])

    const onChange = useCallback((current: number, size: number) => {
        if (selectedDevice) {
            const filter = {
                device_id: selectedDevice,
                levels: alarmLevels
            }
            PagingAlarmRecordsRequest(current, size, dateRange[0].utc().unix(), dateRange[1].utc().unix(), filter).then(res => {
                if (res.code === 200) {
                    setTable(Object.assign({}, table, {data: res.data}))
                }
            })
            GetAlarmStatisticsRequest(dateRange[0].utc().unix(), dateRange[1].utc().unix(), filter).then(res => {
                if (res.code === 200) {
                    const {info, warn, critical, time} = res.data
                    const legend = new Map<string, number>([
                        [AlarmLevelInfo, info.length ? info.reduce((total, current) => total + current) : 0],
                        [AlarmLevelWarn, warn.length ? warn.reduce((total, current) => total + current) : 0],
                        [AlarmLevelCritical, critical.length ? critical.reduce((total, current) => total + current) : 0],
                    ])
                    const series = [
                        {name: AlarmLevelInfo, type: "bar", data: info, color: ColorInfo},
                        {name: AlarmLevelWarn, type: "bar", data: warn, color: ColorWarn},
                        {name: AlarmLevelCritical, type: "bar", data: critical, color: ColorDanger},
                    ]
                    setOption(Object.assign({}, DefaultMultiBarOption, {
                        legend: {
                            padding: 0, left: '3%', formatter: (name: string) => {
                                return `${name}(${legend.get(name)})`
                            }
                        },
                        xAxis: {
                            type: 'category',
                            axisTick: {show: false},
                            data: time.map(item => moment.unix(item).local().format("YYYY-MM-DD"))
                        },
                        series: series
                    }))
                }
            })
        }
    }, [selectedDevice, dateRange, alarmLevels])

    const renderDeviceSelect = () => {
        if (device) {
            if (device.typeId === DeviceType.Gateway || device.typeId === DeviceType.Router) {
                return <Label name={"设备"}>
                    <Select style={{width:"128px"}} bordered={false} defaultActiveFirstOption={true}
                            defaultValue={devices?.length ? devices[0].id : undefined} onChange={value => setSelectedDevice(value)}>
                        {
                            devices?.filter(item => item.category === 3).map(item => (<Option key={item.id} value={item.id}>{item.name}</Option>))
                        }
                    </Select>
                </Label>
            }
        }
    }

    const columns = [
        {
            title: '名称',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: '报警级别',
            dataIndex: 'level',
            key: 'level',
            render: (level: number) => {
                switch (level) {
                    case 1:
                        return <Tag color={ColorInfo}>提示</Tag>
                    case 2:
                        return <Tag color={ColorWarn}>重要</Tag>
                    case 3:
                        return <Tag color={ColorDanger}>紧急</Tag>
                }
            }
        },
        {
            title: '报警内容',
            dataIndex: 'rule',
            key: 'rule',
            render: (_: any, record: any) => {
                return `当前【${GetFieldName(record.rule.field)}】值为: 
                ${record.value.toFixed(record.property.precision)}${record.property.unit}\n
                ${OperationTranslate(record.rule.operation)}设定的阈值:${record.rule.threshold.toFixed(record.property.precision)}${record.property.unit}`
            }
        },
        {
            title: '发生时间',
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (timestamp: number) => {
                return moment(timestamp * 1000).format("YYYY-MM-DD HH:mm:ss")
            }
        },
        {
            title: '操作',
            key: 'action',
            width: 64,
            render: (_: any, record: any) => {
                return <div>
                    <Popconfirm placement="left" title="确认要删除该规则吗?"
                                okText="删除" cancelText="取消">
                        <Button type="text" size="small" icon={<DeleteOutlined/>} danger/>
                    </Popconfirm>
                </div>
            }
        }
    ]

    const renderAlertPage = () => {
        if (selectedDevice) {
            return <div>
                <Row justify={"end"} style={{textAlign: "center"}}>
                    <Col>
                        <Space>
                            {
                                renderDeviceSelect()
                            }
                            <Label name={"报警级别"}>
                                <Select bordered={false} mode={"multiple"} value={alarmLevels}
                                        style={{width: "200px"}} onChange={value => {
                                    console.log(value)
                                    if (value.length) {
                                        setAlarmLevels(value)
                                    } else {
                                        setAlarmLevels([1, 2, 3])
                                    }
                                }}>
                                    <Option key={1} value={1}>提示</Option>
                                    <Option key={2} value={2}>重要</Option>
                                    <Option key={3} value={3}>紧急</Option>
                                </Select>
                            </Label>
                            <RangePicker
                                value={[dateRange[0], dateRange[1]]}
                                onChange={(date, dateString) => {
                                    if (dateString) {
                                        setDateRange([moment(dateString[0]).startOf('day'), moment(dateString[1]).endOf('day')])
                                    }
                                }}/>
                            <Button icon={<BarChartOutlined/>} onClick={() => setChartVisible(!chartVisible)}/>
                        </Space>
                    </Col>
                </Row>
                <Row justify={"start"} style={{paddingTop: "8px"}} hidden={!chartVisible}>
                    <Col span={24}>
                        <ReactECharts option={option}
                                      style={{height: "200px", width: "100%"}}/>
                    </Col>
                </Row>
                <br/>
                <Row justify={"start"}>
                    <Col span={24}>
                        <TableLayout columns={columns} isLoading={table.isLoading} pagination={table.pagination}
                                     refreshKey={table.refreshKey} data={table.data} onChange={onChange}/>
                    </Col>
                </Row>
            </div>
        }
        return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={"数据不足"}/>
    }

    return renderAlertPage()
}

export default AlertPage