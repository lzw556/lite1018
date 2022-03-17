import {Button, Card, Col, DatePicker, Popconfirm, Row, Select, Space, Tag, Tree} from "antd";
import {Content} from "antd/lib/layout/layout";
import Label from "../../../components/label";
import {useCallback, useEffect, useState} from "react";
import moment from "moment";
import MyBreadcrumb from "../../../components/myBreadcrumb";
import {
    GetAlarmRecordAcknowledgeRequest,
    PagingAlarmRecordRequest,
    RemoveAlarmRecordRequest
} from "../../../apis/alarm";
import {PageResult} from "../../../types/page";
import TableLayout from "../../layout/TableLayout";
import {ColorDanger, ColorInfo, ColorWarn} from "../../../constants/color";
import {DeviceType} from "../../../types/device_type";
import HasPermission from "../../../permission";
import {Permission} from "../../../permission/permission";
import {DeleteOutlined} from "@ant-design/icons";
import AcknowledgeModal from "./acknowledgeModal";
import AcknowledgeViewModal from "./acknowledgeViewModal";

const {Option} = Select
const {RangePicker} = DatePicker

const AlarmRecordPage = () => {
    const [startDate, setStartDate] = useState<moment.Moment>(moment().startOf("day").subtract(1, "day"))
    const [endDate, setEndDate] = useState<moment.Moment>(moment().endOf("day"))
    const [dataSource, setDataSource] = useState<PageResult<any[]>>()
    const [alertLevels, setAlertLevels] = useState<number[]>([1, 2, 3])
    const [refreshKey, setRefreshKey] = useState<number>(0)
    const [alarmRecord, setAlarmRecord] = useState<any>()
    const [acknowledge, setAcknowledge] = useState<any>()
    const [status, setStatus] = useState<any>([0,1,2])

    const fetchAlarmRecords = useCallback((current: number, size: number) => {
        const filters:any = {
            levels: alertLevels.join(","),
            status: "",
        }
        if (status && status.length > 0) {
            filters.status = status.join(",")
        }
        PagingAlarmRecordRequest(current, size, startDate.utc().unix(), endDate.utc().unix(), filters).then(setDataSource)
    }, [startDate, endDate, alertLevels, refreshKey, status])

    useEffect(() => {
        fetchAlarmRecords(1, 10)
    }, [fetchAlarmRecords])

    const onDelete = (id: number) => {
        RemoveAlarmRecordRequest(id).then(_ => onRefresh())
    }

    const onRefresh = () => {
        setRefreshKey(refreshKey + 1)
    }

    const onAcknowledge = (record: any) => {
        setAlarmRecord(record)
    }

    const onViewAcknowledge = (id: number) => {
        GetAlarmRecordAcknowledgeRequest(id).then(setAcknowledge)
    }

    const renderFilterDropdown = ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => {
        const data = {
            title: "全选",
            key: -1,
            children: [
                {
                    title: "未处理",
                    key: 0,
                },
                {
                    title: "手动处理",
                    key: 1,
                },
                {
                    title: "系统自动处理",
                    key: 2,
                }
            ]
        }
        return <div style={{padding: "4px 4px"}}>
            <Row justify={"start"}>
                <Col span={24}>
                    <Tree treeData={[data]}
                          selectable={false}
                          checkable
                          defaultExpandAll
                          checkedKeys={status}
                          showLine={false} showIcon={false} onCheck={(checkKeys: any, e: any) => {
                              setStatus(checkKeys.filter((key:any) => key !== -1))
                    }}/>
                </Col>
            </Row>
        </div>
    }

    const columns: any = [
        {
            title: '报警级别',
            dataIndex: 'level',
            key: 'level',
            width: '8%',
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
            title: '报警源',
            dataIndex: 'sourceType',
            key: 'sourceType',
            width: '7%',
            render: (sourceType: any) => {
                return sourceType.indexOf("device") > -1 ? "设备" : "资产"
            }
        },
        {
            title: '资源名称',
            dataIndex: 'source',
            key: 'source',
            width: '10%',
            render: (source: any, record: any) => {
                return source.name
            }
        },
        {
            title: '资源类型',
            dataIndex: 'source',
            key: 'type',
            width: '10%',
            render: (source: any) => {
                return DeviceType.toString(source.typeId)
            }
        },
        {
            title: '报警详情',
            dataIndex: 'metric',
            key: 'metric',
            width: '15%',
            render: (metric: any, record: any) => {
                return `${metric.name} ${record.operation} ${record.threshold}${metric.unit} 报警值: ${record.value}${metric.unit}`
            }
        },
        {
            title: '发生时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: '15%',
            render: (createdAt: number) => {
                return moment.unix(createdAt).local().format("YYYY-MM-DD HH:mm:ss")
            }
        },
        {
            title: '持续时间',
            dataIndex: 'duration',
            key: 'duration',
            width: '10%',
            render: (_: any, record: any) => {
                switch (record.status) {
                    case 1:
                    case 2:
                        return moment.unix(record.createdAt).local().from(moment.unix(record.updatedAt).local(), true)
                    default:
                        return moment.unix(record.createdAt).local().fromNow(true)
                }
            }
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: "5%",
            filterDropdown: renderFilterDropdown,
            render: (status: number) => {
                switch (status) {
                    case 1:
                        return <Tag color="blue">手动处理</Tag>
                    case 2:
                        return <Tag color="green">系统自动处理</Tag>
                    default:
                        return <Tag>未处理</Tag>
                }
            }
        },
        {
            title: '操作',
            key: 'action',
            width: 64,
            fixed: 'right',
            render: (_: any, record: any) => {
                return <Space>
                    {
                        record.status === 0 ?
                            <Button type="link" ghost size={"small"}
                                    onClick={() => onAcknowledge(record)}>标记为已处理</Button> :
                            <Button disabled={record.status === 2} type="link" ghost size={"small"}
                                    onClick={() => onViewAcknowledge(record.id)}>查看处理详情</Button>
                    }
                    <HasPermission value={Permission.AlarmRecordAcknowledge}>
                        <Popconfirm placement="left" title="确认要删除该规则吗?" onConfirm={() => onDelete(record.id)}
                                    okText="删除" cancelText="取消">
                            <Button type="text" size="small" icon={<DeleteOutlined/>} danger/>
                        </Popconfirm>
                    </HasPermission>
                </Space>
            }
        }
    ]

    return <Content>
        <MyBreadcrumb/>
        <Row justify="center">
            <Col span={24}>
                <Card>
                    <Row justify={"start"}>
                        <Col span={24}>
                            <Space>
                                <Label name={"报警级别"}>
                                    <Select bordered={false} mode={"multiple"} value={alertLevels}
                                            style={{width: "200px"}} onChange={value => {
                                        if (value.length) {
                                            setAlertLevels(value)
                                        } else {
                                            setAlertLevels([1, 2, 3])
                                        }
                                    }}>
                                        <Option key={1} value={1}>提示</Option>
                                        <Option key={2} value={2}>重要</Option>
                                        <Option key={3} value={3}>紧急</Option>
                                    </Select>
                                </Label>
                                <RangePicker
                                    value={[startDate, endDate]}
                                    allowClear={false}
                                    onChange={(date, dateString) => {
                                        if (date) {
                                            setStartDate(moment(date[0]))
                                            setEndDate(moment(date[1]))
                                        }
                                    }}/>
                            </Space>
                        </Col>
                    </Row>
                    <br/>
                    <Row justify={"start"}>
                        <Col span={24}>
                            <TableLayout emptyText={"报警记录列表为空"}
                                         columns={columns}
                                         dataSource={dataSource}
                                         onPageChange={fetchAlarmRecords}/>
                        </Col>
                    </Row>
                </Card>
            </Col>
        </Row>
        {
            alarmRecord && <AcknowledgeModal visible={alarmRecord} record={alarmRecord}
                                             onCancel={() => setAlarmRecord(undefined)}
                                             onSuccess={() => {
                                                 setAlarmRecord(undefined)
                                                 onRefresh()
                                             }}/>
        }
        {
            acknowledge && <AcknowledgeViewModal visible={acknowledge} acknowledge={acknowledge} onCancel={() => setAcknowledge(undefined)}/>
        }
    </Content>
}

export default AlarmRecordPage