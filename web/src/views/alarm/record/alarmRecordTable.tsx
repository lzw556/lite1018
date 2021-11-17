import {FC, useCallback, useState} from "react";
import TableLayout, {TableProps} from "../../layout/TableLayout";
import {PagingAlarmRecordsRequest, RemoveAlarmRecordRequest} from "../../../apis/alarm";
import {Button, message, Popconfirm, Tag} from "antd";
import {ColorDanger, ColorInfo, ColorWarn} from "../../../constants/color";
import {DeviceTypeString} from "../../../types/device_type";
import {GetFieldName} from "../../../constants/field";
import {OperationTranslate} from "../../../constants/rule";
import moment from "moment";
import {DeleteOutlined} from "@ant-design/icons";

export interface AlarmRecordTableProps {
    type: "active" | "history"
    start: number
    stop: number
    device: number;
    asset: number;
    levels: number[]
}

const AlarmRecordTable:FC<AlarmRecordTableProps> = ({type,start, stop, device, asset, levels}) => {
    const [table, setTable] = useState<TableProps>({data: {}, isLoading: false, pagination: true, refreshKey: 0})

    const onChange = useCallback((current: number, size: number) => {
        const filter = {
            device_id: device,
            asset_id: asset,
            levels: levels,
            type: type,
        }
        PagingAlarmRecordsRequest(current, size, start, stop, filter).then(res => {
            if (res.code === 200) {
                setTable(Object.assign({}, table, {data: res.data}))
            }
        })
    }, [asset, device, start, stop, levels, type])

    const onDelete = (id: number) => {
        RemoveAlarmRecordRequest(id).then(res => {
            if (res.code === 200) {
                message.success("删除成功").then()
                onRefresh()
            } else {
                message.error("删除失败").then()
            }
        })
    }

    const onRefresh = () => {
        setTable(Object.assign({}, table, {refreshKey: table.refreshKey + 1}))
    }

    const columns = [
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
            title: '设备名称',
            dataIndex: 'device',
            key: 'device',
            render: (device: any) => {
                return device.name
            }
        },
        {
            title: '设备类型',
            dataIndex: 'device',
            key: 'type',
            render: (device: any) => {
                return DeviceTypeString(device.typeId)
            }
        },
        {
            title: '报警内容',
            dataIndex: 'rule',
            key: 'rule',
            render: (_: any, record: any) => {
                console.log(record)
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
                    <Popconfirm placement="left" title="确认要删除该规则吗?" onConfirm={() => onDelete(record.id)}
                                okText="删除" cancelText="取消">
                        <Button type="text" size="small" icon={<DeleteOutlined/>} danger/>
                    </Popconfirm>
                </div>
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

    return <TableLayout columns={renderColumns()} isLoading={table.isLoading} pagination={table.pagination}
                        refreshKey={table.refreshKey} data={table.data} onChange={onChange}/>
}

export default AlarmRecordTable