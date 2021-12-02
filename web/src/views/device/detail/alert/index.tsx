import {Device} from "../../../../types/device";
import {FC, useCallback, useEffect, useState} from "react";
import {DeviceType, GetSensors} from "../../../../types/device_type";
import Label from "../../../../components/label";
import {Button, Col, DatePicker, Dropdown, Empty, Menu, Popconfirm, Row, Select, Space, Tag} from "antd";
import {GetChildrenRequest} from "../../../../apis/device";
import moment from "moment";
import {BarChartOutlined, DeleteOutlined, EditOutlined} from "@ant-design/icons";
import {
    AcknowledgeAlarmRecordRequest,
    GetAlarmStatisticsRequest,
    PagingAlarmRecordsRequest,
    RemoveAlarmRecordRequest
} from "../../../../apis/alarm";
import TableLayout, {TableProps} from "../../../layout/TableLayout";
import {ColorDanger, ColorInfo, ColorWarn} from "../../../../constants/color";
import {AlarmLevelCritical, AlarmLevelInfo, AlarmLevelWarn, OperationTranslate} from "../../../../constants/rule";
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
                GetChildrenRequest(device.id).then(data => {
                    const result = data.filter(item => GetSensors().includes(item.typeId))
                    setDevices(result)
                    if (result.length > 0) {
                        setSelectedDevice(result[0].id)
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
                levels: alarmLevels,
                type: "active"
            }
            PagingAlarmRecordsRequest(current, size, dateRange[0].utc().unix(), dateRange[1].utc().unix(), filter).then(data => {
                setTable(Object.assign({}, table, {data: data}))
            })
            GetAlarmStatisticsRequest(dateRange[0].utc().unix(), dateRange[1].utc().unix(), filter).then(data => {
                const {info, warn, critical, time} = data
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
            })
        }
    }, [selectedDevice, dateRange, alarmLevels])

    const renderDeviceSelect = () => {
        if (device) {
            if (device.typeId === DeviceType.Gateway || device.typeId === DeviceType.Router) {
                return <Label name={"设备"}>
                    <Select style={{width: "128px"}} bordered={false} defaultActiveFirstOption={true}
                            defaultValue={devices?.length ? devices[0].id : undefined}
                            onChange={value => setSelectedDevice(value)}>
                        {
                            devices?.map(item => (<Option key={item.id} value={item.id}>{item.name}</Option>))
                        }
                    </Select>
                </Label>
            }
        }
    }

    const onRefresh = () => {
        setTable(Object.assign({}, table, {refreshKey: table.refreshKey + 1}))
    }

    const onDelete = (id: number) => {
        RemoveAlarmRecordRequest(id).then(_ => onRefresh())
    }

    const onAcknowledge = (id: number) => {
        AcknowledgeAlarmRecordRequest(id).then(_ => onRefresh())
    }

    const renderEditMenu = (record: any) => {
        return <Menu onClick={() => onAcknowledge(record.id)}>
            <Menu.Item disabled={record.acknowledged}>标记为已处理</Menu.Item>
        </Menu>
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
            title: '持续时间',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (updatedAt: number, record: any) => {
                switch (record.status) {
                    case 1:
                    case 2:
                        return moment.unix(record.timestamp).local().from(moment.unix(updatedAt).local(), true)
                    default:
                        return moment.unix(record.timestamp).local().fromNow(true)
                }
            }
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status: number) => {
                switch (status) {
                    case 1:
                        return <Tag color="blue">已处理</Tag>
                    case 2:
                        return <Tag color="green">已恢复</Tag>
                    default:
                        return <Tag>未处理</Tag>
                }
            }
        },
        {
            title: '操作',
            key: 'action',
            width: 64,
            render: (_: any, record: any) => {
                return <Space>
                    {
                        <Dropdown overlay={renderEditMenu(record)}>
                            <Button type={"text"} size={"small"} icon={<EditOutlined/>}/>
                        </Dropdown>
                    }
                    <Popconfirm placement="left" title="确认要删除该规则吗?"
                                okText="删除" cancelText="取消" onConfirm={() => onDelete(record.id)}>
                        <Button type="text" size="small" icon={<DeleteOutlined/>} danger/>
                    </Popconfirm>
                </Space>
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