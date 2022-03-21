import TableLayout from "../../layout/TableLayout";
import {useCallback, useEffect, useState} from "react";
import {
    GetAlarmRuleRequest,
    PagingAlarmRuleRequest,
    RemoveAlarmRuleRequest, RemoveAlarmRuleSourceRequest,
    UpdateAlarmRuleStatusRequest
} from "../../../apis/alarm";
import {Button, Col, Divider, Dropdown, Menu, Popconfirm, Row, Space, Table, Tag, Typography} from "antd";
import HasPermission from "../../../permission";
import {Permission} from "../../../permission/permission";
import {PageResult} from "../../../types/page";
import moment from "moment";
import "../../../string-extension"
import {ColorDanger, ColorHealth, ColorInfo, ColorWarn} from "../../../constants/color";
import EditAlarmRuleModal from "./modal/editAlarmRuleModal";
import {DeleteOutlined, EditOutlined} from "@ant-design/icons";
import AddSourceModal from "./modal/addSourceModal";
import { isMobile } from "../../../utils/deviceDetection";

const AlarmRule = () => {
    const [dataSource, setDataSource] = useState<PageResult<any[]>>()
    const [refreshKey, setRefreshKey] = useState<number>(0)
    const [alarmRule, setAlarmRule] = useState<any>()
    const [editVisible, setEditVisible] = useState<boolean>(false)
    const [addVisible, setAddVisible] = useState<boolean>(false)

    const onDelete = (id: number) => {
        RemoveAlarmRuleRequest(id).then(_ => onRefresh())
    }

    const onRefresh = () => {
        setRefreshKey(refreshKey + 1)
    }

    const onEdit = (key: any, id: number) => {
        switch (key) {
            case "editCondition":
                setEditVisible(true)
                break
            case "addMonitor":
                setAddVisible(true)
                break
        }
        GetAlarmRuleRequest(id).then(setAlarmRule)
    }

    const onEditStatus = (id: number, status: number) => {
        UpdateAlarmRuleStatusRequest(id, status).then(_ => onRefresh())
    }

    const renderEditMenus = (record:any) => {
        return <Menu onClick={e => onEdit(e.key, record.id)}>
            <Menu.Item key={"editCondition"}>更新报警条件</Menu.Item>
            <Menu.Item key={"addMonitor"}>添加监控对象</Menu.Item>
        </Menu>
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
            title: '报警等级',
            dataIndex: 'level',
            key: 'level',
            render: (level: any) => {
                switch (level) {
                    case 1:
                        return <Tag color={ColorInfo}>提示</Tag>
                    case 2:
                        return <Tag color={ColorWarn}>重要</Tag>
                    case 3:
                        return <Tag color={ColorDanger}>紧急</Tag>
                }
                return "无"
            }
        },
        {
            title: '启停状态',
            dataIndex: 'enabled',
            key: 'enabled',
            render: (enabled: boolean) => {
                return enabled ?
                    <Typography.Text strong style={{color: ColorHealth}}>启用</Typography.Text> :
                    <Typography.Text strong style={{color: ColorDanger}}>停用</Typography.Text>
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
                        {
                            record.enabled ?
                                <a style={{color: ColorDanger}} onClick={() => onEditStatus(record.id, 0)}>停用</a> :
                                <a style={{color: ColorHealth}} onClick={() => onEditStatus(record.id, 1)}>启用</a>
                        }
                    </HasPermission>
                    <HasPermission value={Permission.AlarmEdit}>
                        <Divider type={"vertical"}/>
                        <Dropdown overlay={renderEditMenus(record)}>
                            <Button type="text" size="small" icon={<EditOutlined/>}/>
                        </Dropdown>
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

    const onRemoveDeviceFromAlarmRule = (ruleId: number, sourceId: number) => {
        RemoveAlarmRuleSourceRequest(ruleId, {ids: [sourceId]}).then(data => onRefresh());
    }

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
                    title: '报警状态',
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
                        if (state && state.record) {
                            return `${state.record.value} ${record.metric.unit}`
                        }
                        return "无"
                    }
                },
                {
                    title:'操作',
                    key: 'action',
                    width: '20%',
                    render: (_:any, source:any) => {
                        return <Space>
                            <Popconfirm title={`确认要将【${source.name}】移除【${record.name}】报警规则吗?`} onConfirm={() => onRemoveDeviceFromAlarmRule(record.id, source.id)}
                                        okText="移除" cancelText="取消">
                                <Button type="text" size="small" danger>移除</Button>
                            </Popconfirm>
                        </Space>
                    },
                }
            ]
        }
        return <Table rowKey={record => record.id} columns={columns} dataSource={record.sources} pagination={false}/>
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
                                 indentSize: 5,
                             }}
                             dataSource={dataSource}
                             onPageChange={fetchAlarmRules} 
                             simple={isMobile} 
                             scroll={isMobile ? {x:1000} : undefined}/>
            </Col>
        </Row>
        {
            alarmRule && <EditAlarmRuleModal value={alarmRule} visible={editVisible}
                                             onCancel={() => {
                                                 setAlarmRule(undefined)
                                                 setEditVisible(false)
                                             }}
                                             onSuccess={() => {
                                                 setAlarmRule(undefined)
                                                 setEditVisible(false)
                                                 onRefresh();
                                             }}/>
        }
        {
            alarmRule && <AddSourceModal value={alarmRule} visible={addVisible}
                                         onCancel={() => {
                                             setAddVisible(false);
                                             setAlarmRule(undefined)
                                         }} onSuccess={() => {
                                             setAddVisible(false);
                                             setAlarmRule(undefined);
                                             onRefresh();
                                         }}/>
        }
    </div>
}

export default AlarmRule