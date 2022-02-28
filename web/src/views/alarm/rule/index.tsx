import TableLayout from "../../layout/TableLayout";
import {useCallback, useEffect, useState} from "react";
import {
    GetAlarmRuleRequest,
    PagingAlarmRuleRequest,
    RemoveAlarmRuleRequest,
    UpdateAlarmRuleStatusRequest
} from "../../../apis/alarm";
import {Button, Col, Divider, Popconfirm, Row, Space, Table, Tag, Typography} from "antd";
import HasPermission from "../../../permission";
import {Permission} from "../../../permission/permission";
import {PageResult} from "../../../types/page";
import moment from "moment";
import "../../../string-extension"
import {ColorDanger, ColorHealth, ColorInfo, ColorWarn} from "../../../constants/color";
import EditAlarmRuleModal from "./modal/editAlarmRuleModal";
import {DeleteOutlined} from "@ant-design/icons";

const AlarmRule = () => {
    const [dataSource, setDataSource] = useState<PageResult<any[]>>()
    const [alarmSource, setAlarmSource] = useState<any>()
    const [refreshKey, setRefreshKey] = useState<number>(0)
    const [alarmRule, setAlarmRule] = useState<any>()


    const onDelete = (id: number) => {
        RemoveAlarmRuleRequest(id).then(_ => onRefresh())
    }

    const onRefresh = () => {
        setRefreshKey(refreshKey + 1)
    }

    const onEdit = (id: number) => {
        GetAlarmRuleRequest(id).then(setAlarmRule)
    }

    const onEditStatus = (id: number, status: number) => {
        UpdateAlarmRuleStatusRequest(id, status).then(_ => onRefresh())
    }

    const columns: any = [
        {
            title: '规则名称',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: '资源类型',
            dataIndex: 'sourceType',
            key: 'sourceType',
            render: (text: string) => {
                return text.indexOf("device") > -1 ? '设备' : '资产'
            }
        },
        {
            title: '资源指标',
            dataIndex: 'metric',
            key: 'metric',
            render: (metric: any) => metric.name
        },
        {
            title: '触发条件',
            dataIndex: 'condition',
            key: 'condition',
            render: (_: any, record: any) => {
                return `${record.operation} ${record.threshold} ${record.metric.unit}`
            }
        },
        {
            title: '启停状态',
            dataIndex: 'enabled',
            key: 'enabled',
            render: (enabled: boolean) => {
                return enabled ?
                    <Typography.Text strong style={{color: ColorHealth}}>启用</Typography.Text> :
                    <Typography.Text strong style={{color: ColorDanger}}>禁用</Typography.Text>
            }
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (timestamp: number) => moment.unix(timestamp).local().format("YYYY-MM-DD HH:mm:ss")
        },
        {
            title: '操作',
            key: 'action',
            width: 200,
            render: (_: any, record: any) => {
                return <>
                    <HasPermission value={Permission.AlarmEdit}>
                        <a onClick={() => onEdit(record.id)}>修改</a>
                    </HasPermission>
                    <HasPermission value={Permission.AlarmEdit}>
                        <Divider type={"vertical"}/>
                        {
                            record.enabled ?
                                <a style={{color: ColorDanger}} onClick={() => onEditStatus(record.id, 0)}>禁用</a> :
                                <a style={{color: ColorHealth}} onClick={() => onEditStatus(record.id, 1)}>启用</a>
                        }
                    </HasPermission>
                    <HasPermission value={Permission.AlarmDelete}>
                        <Divider type={"vertical"}/>
                        <Popconfirm placement="left" title="确认要删除该规则吗?" onConfirm={() => onDelete(record.id)}
                                    okText="删除" cancelText="取消">
                            <Button type="text" size="small" danger><DeleteOutlined/></Button>
                        </Popconfirm>
                    </HasPermission>
                </>
            }
        }
    ]

    const fetchAlarmRules = useCallback((current: number, size: number) => {
        PagingAlarmRuleRequest({}, current, size).then(setDataSource)
    }, [refreshKey])

    useEffect(() => {
        fetchAlarmRules(1, 10)
    }, [fetchAlarmRules])

    const onExpandedRowRender = (record: any) => {
        let columns;
        if (record.sourceType.indexOf("device") > -1) {
            columns = [
                {
                    title: '设备名称',
                    dataIndex: 'name',
                    key: 'name',
                    width: '20%'
                },
                {
                    title: 'MAC地址',
                    dataIndex: 'macAddress',
                    key: 'macAddress',
                    width: "20%",
                    render: (text: string) => text.toUpperCase().macSeparator()
                },
                {
                    title: '报警级别',
                    dataIndex: 'alertStates',
                    key: 'alertStates',
                    width: '10%',
                    render: (states: any) => {
                        const state = states?.find((state: any) => state.rule.id === record.id)
                        if (state) {
                            switch (state.rule.level) {
                                case 1:
                                    return <Tag color={ColorInfo}>提示</Tag>
                                case 2:
                                    return <Tag color={ColorWarn}>重要</Tag>
                                case 3:
                                    return <Tag color={ColorDanger}>紧急</Tag>
                            }
                        }
                        return  <Tag color={ColorHealth}>正常</Tag>
                    }
                },
                {
                    title: "报警值",
                    dataIndex: 'alertStates',
                    key: 'alertValue',
                    render: (states: any) => {
                        const state = states?.find((state: any) => state.rule.id === record.id)
                        console.log(state);
                        if (state && state.record) {
                            return `${state.record.value} ${record.metric.unit}`
                        }
                        return "无"
                    }
                }
            ]
        }
        return <Table columns={columns} dataSource={alarmSource} pagination={false}/>
    }

    const onExpand = (expanded: boolean, record: any) => {
        if (expanded) {
            GetAlarmRuleRequest(record.id).then(data => {
                setAlarmSource(data.sources)
            })
        }
    }

    return <div>
        <Row justify={"start"}>
            <Col span={12}>
                <Space>
                </Space>
            </Col>
        </Row>
        <br/>
        <Row justify={"start"}>
            <Col span={24}>
                <TableLayout emptyText={"报警规则列表为空"}
                             columns={columns}
                             permissions={[Permission.AlarmEdit, Permission.AlarmDelete]}
                             expandable={{
                                 expandedRowRender: onExpandedRowRender,
                                 onExpand: onExpand,
                                 indentSize: 5,
                             }}
                             dataSource={dataSource}
                             onPageChange={fetchAlarmRules}/>
            </Col>
        </Row>
        {
            alarmRule && <EditAlarmRuleModal value={alarmRule} visible={!!alarmRule}
                                             onCancel={() => setAlarmRule(undefined)}
                                             onSuccess={() => {
                                                 setAlarmRule(undefined)
                                                 onRefresh();
                                             }}/>
        }
    </div>
}

export default AlarmRule