import * as React from 'react';
import {PageResult} from '../../types/page';
import moment from "moment";
import {GetAlarmRecordAcknowledgeRequest, PagingAlarmRecordRequest, RemoveAlarmRecordRequest} from '../../apis/alarm';
import {Button, Col, DatePicker, Popconfirm, Row, Select, Space, Tag, Tree} from 'antd';
import {ColorDanger, ColorInfo, ColorWarn} from '../../constants/color';
import {DeviceType} from '../../types/device_type';
import {DeleteOutlined} from '@ant-design/icons';
import TableLayout from '../../views/layout/TableLayout';
import {isMobile} from '../../utils/deviceDetection';
import AcknowledgeModal from '../../views/alarm/record/acknowledgeModal';
import AcknowledgeViewModal from '../../views/alarm/record/acknowledgeViewModal';
import HasPermission from '../../permission';
import {Permission} from '../../permission/permission';
import Label from '../label';

const {Option} = Select
const {RangePicker} = DatePicker

export const FilterableAlarmRecordTable: React.FC<{ sourceId?: number }> = ({sourceId}) => {
    const [startDate, setStartDate] = React.useState<moment.Moment>(moment().startOf("day").subtract(1, "day"))
    const [endDate, setEndDate] = React.useState<moment.Moment>(moment().endOf("day"))
    const [dataSource, setDataSource] = React.useState<PageResult<any[]>>()
    const [alertLevels, setAlertLevels] = React.useState<number[]>([1, 2, 3])
    const [refreshKey, setRefreshKey] = React.useState<number>(0)
    const [alarmRecord, setAlarmRecord] = React.useState<any>()
    const [acknowledge, setAcknowledge] = React.useState<any>()
    const [status, setStatus] = React.useState<any>([0, 1, 2])

    const fetchAlarmRecords = React.useCallback((current: number, size: number) => {
        const filters: any = {
            levels: alertLevels.join(","),
            status: "",
        }
        if (status && status.length > 0) {
            filters.status = status.join(",")
        }
        PagingAlarmRecordRequest(current, size, startDate.utc().unix(), endDate.utc().unix(), filters, sourceId).then(setDataSource)
    }, [startDate, endDate, alertLevels, refreshKey, status])

    React.useEffect(() => {
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

    const renderFilterDropdown = ({setSelectedKeys, selectedKeys, confirm, clearFilters}: any) => {
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
                        setStatus(checkKeys.filter((key: any) => key !== -1))
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
                        return <Tag color={ColorInfo}>次要</Tag>
                    case 2:
                        return <Tag color={ColorWarn}>重要</Tag>
                    case 3:
                        return <Tag color={ColorDanger}>紧急</Tag>
                }
            }
        },
        {
            title: '资源指标',
            dataIndex: 'source',
            key: 'type',
            width: '10%',
            render: (source: any) => {
                if (source) {
                    return DeviceType.toString(source.typeId)
                }
                return "未知指标"
            }
        },
        {
            title: '报警源',
            dataIndex: 'source',
            key: 'source',
            width: '10%',
            render: (source: any, record: any) => {
                if (source) {
                    return source.name
                }
                return "未知资源"
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
            // fixed: 'right',
            render: (_: any, record: any) => {
                return <Space>
                    {
                        record.status === 0 ?
                            <HasPermission value={Permission.AlarmRecordAcknowledge}>
                                <Button type="link" ghost size={"small"}
                                        onClick={() => onAcknowledge(record)}>标记为已处理</Button>
                            </HasPermission> :
                            <HasPermission value={Permission.AlarmRecordAcknowledgeGet}>
                                <Button disabled={record.status === 2} type="link" ghost size={"small"}
                                        onClick={() => onViewAcknowledge(record.id)}>查看处理详情</Button>
                            </HasPermission>
                    }
                    <HasPermission value={Permission.AlarmRecordDelete}>
                        <Popconfirm placement="left" title="确认要删除该报警记录吗?" onConfirm={() => onDelete(record.id)}
                                    okText="删除" cancelText="取消">
                            <Button type="text" size="small" icon={<DeleteOutlined/>} danger/>
                        </Popconfirm>
                    </HasPermission>
                </Space>
            }
        }
    ]

    return <>
        <Row justify={"start"}>
            <Col span={24}>
                <Space direction={isMobile ? 'vertical' : 'horizontal'}>
                    <Label name={"报警级别"}>
                        <Select bordered={false} mode={"multiple"} value={alertLevels}
                                style={{width: "200px"}} onChange={value => {
                            if (value.length) {
                                setAlertLevels(value)
                            } else {
                                setAlertLevels([1, 2, 3])
                            }
                        }}>
                            <Option key={1} value={1}>次要</Option>
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
                             onPageChange={fetchAlarmRecords}
                             simple={isMobile}
                             scroll={isMobile ? {x: 1200} : undefined}/>
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
            acknowledge && <AcknowledgeViewModal visible={acknowledge} acknowledge={acknowledge}
                                                 onCancel={() => setAcknowledge(undefined)}/>
        }
    </>
}