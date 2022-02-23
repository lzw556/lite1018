import TableLayout from "../../layout/TableLayout";
import {useCallback, useEffect, useState} from "react";
import {GetAlarmRuleRequest, PagingAlarmRuleRequest, RemoveAlarmRequest} from "../../../apis/alarm";
import {Button, Col, Divider, Popconfirm, Row, Space, Table} from "antd";
import HasPermission from "../../../permission";
import {Permission} from "../../../permission/permission";
import {PageResult} from "../../../types/page";
import moment from "moment";
import "../../../string-extension"

const AlarmRule = () => {
    const [dataSource, setDataSource] = useState<PageResult<any[]>>()
    const [alarmSource, setAlarmSource] = useState<any>()
    const [refreshKey, setRefreshKey] = useState<number>(0)


    const onDelete = (id: number) => {
        RemoveAlarmRequest(id).then(_ => onRefresh())
    }

    const onRefresh = () => {
        setRefreshKey(refreshKey + 1)
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
                        <Button type={"link"} size={"small"}>修改</Button>
                    </HasPermission>
                    <HasPermission value={Permission.AlarmDelete}>
                        <Divider type={"vertical"}/>
                        <Popconfirm placement="left" title="确认要删除该规则吗?" onConfirm={() => onDelete(record.id)}
                                    okText="删除" cancelText="取消">
                            <Button type="text" size="small" danger>删除</Button>
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
                    title: '名称',
                    dataIndex: 'name',
                    key: 'name'
                },
                {
                    title: 'MAC地址',
                    dataIndex: 'macAddress',
                    key: 'macAddress',
                    render: (text: string) => text.toUpperCase().macSeparator()
                }
            ]
        }
        return <Table columns={columns} dataSource={alarmSource} pagination={false}/>
    }

    const onExpand = (expanded: boolean, record: any) => {
        if (expanded){
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
                             expandable={{expandedRowRender: onExpandedRowRender, onExpand: onExpand}}
                             dataSource={dataSource}
                             onPageChange={fetchAlarmRules}/>
            </Col>
        </Row>
    </div>
}

export default AlarmRule