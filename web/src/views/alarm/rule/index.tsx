import TableLayout from "../../layout/TableLayout";
import {useCallback, useEffect, useState} from "react";
import {GetAlarmRequest, PagingAlarmsRequest, RemoveAlarmRequest} from "../../../apis/alarm";
import {Button, Col, Divider, Popconfirm, Row, Space} from "antd";
import Label from "../../../components/label";
import EditModal from "./modal/editModal";
import {Alarm} from "../../../types/alarm_rule";
import HasPermission from "../../../permission";
import {Permission} from "../../../permission/permission";
import {PageResult} from "../../../types/page";
import {Measurement} from "../../../types/measurement";
import {MeasurementType} from "../../../types/measurement_type";
import moment from "moment";
import AssetTreeSelect from "../../../components/select/assetTreeSelect";

const AlarmRule = () => {
    const [asset, setAsset] = useState<number>(0)
    const [measurement] = useState<number>(0)
    const [alarm, setAlarm] = useState<Alarm>()
    const [editVisible, setEditVisible] = useState<boolean>(false)
    const [dataSource, setDataSource] = useState<PageResult<any[]>>()
    const [refreshKey, setRefreshKey] = useState<number>(0)

    const onEdit = (id: number) => {
        GetAlarmRequest(id).then(data => {
            setAlarm(data)
            setEditVisible(true)
        })
    }

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
            title: '监测点名称',
            dataIndex: 'measurement',
            key: 'measurement',
            render: (measurement: Measurement) => {
                return measurement.name
            }
        },
        {
            title: '监测点类型',
            dataIndex: 'measurement',
            key: 'measurement',
            render: (measurement: Measurement) => {
                return MeasurementType.toString(measurement.type)
            }
        },
        {
            title: '启停状态',
            dataIndex: 'enabled',
            key: 'enabled',
            render: (text: any, record: any) => {
                if (record.enabled) {
                    return "启用"
                }
                return "停用"
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
                        <Button type={"link"} size={"small"} onClick={() => {
                            onEdit(record.id)
                        }}>修改阈值</Button>
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

    const fetchAlarms = useCallback((current: number, size: number) => {
        const filter: any = {}
        if (measurement) {
            filter.measurement_id = measurement
        }
        if (asset) {
            filter.asset_id = asset
            PagingAlarmsRequest(filter, current, size).then(setDataSource)
        }
    }, [asset, measurement, refreshKey])

    useEffect(() => {
        fetchAlarms(1, 10)
    }, [fetchAlarms])

    return <div>
        <Row justify={"start"}>
            <Col span={12}>
                <Space>
                    <Label name={"资产"}>
                        <AssetTreeSelect bordered={false}
                                         style={{minWidth: "144px"}}
                                         placeholder={"所有资产"}
                                         defaultActiveFirstOption={true}
                                         value={asset}
                                         onChange={setAsset}/>
                    </Label>
                </Space>
            </Col>
        </Row>
        <br/>
        <Row justify={"start"}>
            <Col span={24}>
                <TableLayout emptyText={"报警规则列表为空"}
                             columns={columns}
                             permissions={[Permission.AlarmEdit, Permission.AlarmDelete]}
                             dataSource={dataSource}
                             onPageChange={fetchAlarms}/>
            </Col>
        </Row>
        {
            alarm && <EditModal alarm={alarm} visible={editVisible} onSuccess={() => {
                setEditVisible(false)
            }} onCancel={() => {
                setEditVisible(false)
            }}/>
        }
    </div>
}

export default AlarmRule