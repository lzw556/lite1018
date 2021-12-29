import {FC, useCallback, useEffect, useState} from "react";
import TableLayout from "../../layout/TableLayout";
import {GetAcknowledgeRequest, PagingAlarmRecordsRequest, RemoveAlarmRecordRequest} from "../../../apis/alarm";
import {Button, Popconfirm, Space, Tag} from "antd";
import {ColorDanger, ColorInfo, ColorWarn} from "../../../constants/color";
import moment from "moment";
import {DeleteOutlined} from "@ant-design/icons";
import usePermission, {Permission} from "../../../permission/permission";
import HasPermission from "../../../permission";
import {PageResult} from "../../../types/page";
import {Measurement} from "../../../types/measurement";
import {MeasurementField} from "../../../types/measurement_data";
import AcknowledgeModal from "./acknowledgeModal";
import AcknowledgeViewModal from "./acknowledgeViewModal";

export interface AlarmRecordTableProps {
    type: "active" | "history"
    start: number
    stop: number
    asset?: number;
    levels: number[]
    statuses: number[]
}

const AlarmRecordTable: FC<AlarmRecordTableProps> = ({type, start, stop, asset, levels, statuses}) => {
    const {hasPermission} = usePermission()
    const [record, setRecord] = useState<any>()
    const [acknowledge, setAcknowledge] = useState<any>()
    const [dataSource, setDataSource] = useState<PageResult<any[]>>()

    const fetchAlarmRecords = useCallback((current: number, size: number) => {
        const filter: any = {
            levels: levels.join(","),
            statuses: statuses.join(","),
        }
        if (asset) {
            filter.asset_id = asset
        }
        PagingAlarmRecordsRequest(current, size, start, stop, filter).then(setDataSource)
    }, [asset, start, stop, levels, type, statuses])

    useEffect(() => {
        fetchAlarmRecords(1, 10)
    }, [fetchAlarmRecords])

    const onDelete = (id: number) => {
        RemoveAlarmRecordRequest(id).then(_ => onRefresh())
    }

    const onRefresh = () => {
        // setTable(Object.assign({}, table, {refreshKey: table.refreshKey + 1}))
    }

    const onAcknowledge = (record:any) => {
        setRecord(record)
    }

    const onViewAcknowledge = (id:number) => {
        GetAcknowledgeRequest(id).then(setAcknowledge)
    }

    const columns: any = [
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
            title: '报警监测点',
            dataIndex: 'measurement',
            key: 'measurement',
            render: (measurement: Measurement) => {
                return measurement.name
            }
        },
        {
            title: "报警属性",
            dataIndex: "field",
            key: "field",
            render: (field: MeasurementField) => {
                return field.title
            }
        },
        {
            title: "报警值",
            dataIndex: "value",
            key: "value",
            render: (value: number, record: any) => {
                return `${value.toFixed(record.field.precision)}${record.field.unit}`
            }
        },
        {
            title: '报警内容',
            dataIndex: 'rule',
            key: 'rule',
            render: (rule: any, record: any) => {
                return `${rule.operation}${rule.threshold}${record.field.unit}`
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
            filters: [
                {
                    text: '未处理',
                    value: 0
                },
                {
                    text: '手动处理',
                    value: 1
                },
                {
                    text: '系统自动处理',
                    value: 2
                }
            ],
            onFilter: (value: number, record: any) => record.status === value,
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
                            <Button type="link" ghost size={"small"} onClick={() => onAcknowledge(record)}>标记为已处理</Button> :
                            <Button type="link" ghost size={"small"} onClick={() => onViewAcknowledge(record.id)}>查看处理详情</Button>
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

    const renderColumns = () => {
        if (type === 'active') {
            return [
                {
                    title: '名称',
                    dataIndex: 'name',
                    key: 'name'
                },
                ...columns
            ]
        }
        return columns
    }

    return <>
        <TableLayout emptyText={"报警记录列表为空"}
                     permissions={[Permission.AlarmRecordAcknowledge, Permission.AlarmRecordDelete]}
                     columns={renderColumns()}
                     dataSource={dataSource}
                     onPageChange={fetchAlarmRecords}/>
        {
            record && <AcknowledgeModal visible={record} record={record} onCancel={() => setRecord(undefined)} onSuccess={() => setRecord(undefined)}/>
        }
        {
            acknowledge && <AcknowledgeViewModal visible={acknowledge} acknowledge={acknowledge} onCancel={() => setAcknowledge(undefined)}/>
        }
    </>
}

export default AlarmRecordTable