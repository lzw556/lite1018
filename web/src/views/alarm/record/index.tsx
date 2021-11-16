import {Button, Card, Col, DatePicker, message, Popconfirm, Row, Select, Space, Tag} from "antd";
import {Content} from "antd/lib/layout/layout";
import Label from "../../../components/label";
import {DeleteOutlined} from "@ant-design/icons";
import {useCallback, useState} from "react";
import moment from "moment";
import TableLayout, {TableProps} from "../../layout/TableLayout";
import {PagingAlarmRecordsRequest, RemoveAlarmRecordRequest} from "../../../apis/alarm";
import SensorSelect from "../../../components/sensorSelect";
import {ColorDanger, ColorInfo, ColorWarn} from "../../../constants/color";
import {DeviceTypeString} from "../../../types/device_type";
import {OperationTranslate} from "../../../constants/rule";
import AssetSelect from "../../../components/assetSelect";
import {GetFieldName} from "../../../constants/field";
import MyBreadcrumb from "../../../components/myBreadcrumb";

const {Option} = Select
const {RangePicker} = DatePicker

const AlarmRecordPage = () => {
    const [table, setTable] = useState<TableProps>({data: {}, isLoading: false, pagination: true, refreshKey: 0})
    const [assetId, setAssetId] = useState<number>(0)
    const [deviceId, setDeviceId] = useState<number>(0)
    const [startDate, setStartDate] = useState<moment.Moment>(moment().startOf("day").subtract(1, "day"))
    const [endDate, setEndDate] = useState<moment.Moment>(moment().endOf("day"))
    const [alarmLevels, setAlarmLevels] = useState<number[]>([1, 2, 3])
    const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])

    const onAssetChanged = (value: any) => {
        setAssetId(value)
        setDeviceId(0)
    }

    const onDeviceChanged = (value: any) => {
        setDeviceId(value)
    }

    const onChange = useCallback((current: number, size: number) => {
        const filter = {
            device_id: deviceId,
            asset_id: assetId,
            levels: alarmLevels
        }
        PagingAlarmRecordsRequest(current, size, startDate.utc().unix(), endDate.utc().unix(), filter).then(res => {
            if (res.code === 200) {
                console.log(res.data)
                setTable(Object.assign({}, table, {data: res.data}))
            }
        })
    }, [assetId, deviceId, startDate, endDate, alarmLevels])

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

    return <Content>
        <MyBreadcrumb items={["报警管理", "报警列表"]}>
            <Space>
                <RangePicker
                    value={[startDate, endDate]}
                    allowClear={false}
                    onChange={(date, dateString) => {
                        if (dateString) {
                            setStartDate(moment(dateString[0]).startOf('day'))
                            setEndDate(moment(dateString[1]).endOf('day'))
                        }
                    }}/>
            </Space>
        </MyBreadcrumb>
        <Row justify="center">
            <Col span={24}>
                <Card>
                    <Row justify={"start"}>
                        <Col span={24}>
                            <Space>
                                <Label name={"资产"}>
                                    <AssetSelect bordered={false} style={{width: "128px"}} defaultValue={assetId}
                                                 defaultActiveFirstOption={true}
                                                 placeholder={"请选择资产"}
                                                 onChange={onAssetChanged}>
                                        <Option key={0} value={0}>所有资产</Option>
                                    </AssetSelect>
                                </Label>
                                <Label name={"设备"}>
                                    <SensorSelect bordered={false} style={{width: "128px"}} value={deviceId}
                                                  assetId={assetId} placeholder={"请选择设备"}
                                                  onChange={onDeviceChanged}/>
                                </Label>
                                <Label name={"报警级别"}>
                                    <Select bordered={false} mode={"multiple"} value={alarmLevels}
                                            style={{width: "200px"}} onChange={value => {
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
                            </Space>
                        </Col>
                    </Row>
                    <br/>
                    <Row justify={"start"}>
                        <Col span={24}>
                            <TableLayout columns={columns} isLoading={table.isLoading} pagination={table.pagination}
                                         refreshKey={table.refreshKey} data={table.data} onChange={onChange}/>
                        </Col>
                    </Row>
                </Card>
            </Col>
        </Row>
    </Content>
}

export default AlarmRecordPage