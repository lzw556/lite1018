import {Button, Col, Popconfirm, Row, Space} from "antd";
import TableLayout from "../../layout/TableLayout";
import {useCallback, useEffect, useState} from "react";
import {PagingAlarmTemplateRequest, RemoveAlarmTemplateRequest} from "../../../apis/alarm";
import Label from "../../../components/label";
import {DeleteOutlined, EditOutlined} from "@ant-design/icons";
import HasPermission from "../../../permission";
import {Permission} from "../../../permission/permission";
import {PageResult} from "../../../types/page";
import MeasurementTypeSelect from "../../../components/select/measurementTypeSelect";
import {MeasurementType} from "../../../types/measurement_type";

const AlarmRuleTemplate = () => {
    const [measurementType, setMeasurementType] = useState<MeasurementType>()
    const [dataSource, setDataSource] = useState<PageResult<any>>()
    const [refreshKey, setRefreshKey] = useState(0)

    const fetchAlarmTemplates = useCallback((current: number, size: number) => {
        const filter:any = {}
        if (measurementType) {
            filter.measurement_type = measurementType
        }
        PagingAlarmTemplateRequest(current, size, filter).then(setDataSource)
    }, [measurementType, refreshKey])

    useEffect(() => {
        fetchAlarmTemplates(1, 10)
    }, [fetchAlarmTemplates])

    const onRefresh = () => {
        setRefreshKey(refreshKey + 1)
    }

    const onDelete = (id: number) => {
        RemoveAlarmTemplateRequest(id).then(_ => onRefresh())
    }

    const columns = [
        {
            title: '模板名称',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: '监测点类型',
            dataIndex: 'measurementType',
            key: 'measurementType',
            render: (value: MeasurementType) => {
                return MeasurementType.toString(value)
            }
        },
        {
            title: '操作',
            key: 'action',
            render: (text: any, record: any) => (
                <Space>
                    <HasPermission value={Permission.AlarmTemplateEdit}>
                        <Button type="text" size="small"
                                href={`#/alarm-management?locale=alarmRules/editAlarmRuleTemplate&id=${record.id}`}
                                icon={<EditOutlined/>}/>
                    </HasPermission>
                    <HasPermission value={Permission.AlarmTemplateDelete}>
                        <Popconfirm placement="left" title="确认要删除该模板吗?" onConfirm={() => onDelete(record.id)}
                                    okText="删除" cancelText="取消">
                            <Button type="text" size="small" icon={<DeleteOutlined/>} danger/>
                        </Popconfirm>
                    </HasPermission>
                </Space>
            )
        }
    ]

    return <div>
        <Row justify={"space-between"}>
            <Col span={12}>
                <Space>
                    <Label name={"监测点类型"}>
                        <MeasurementTypeSelect
                            bordered={false}
                            allowClear
                            placeholder={"所有类型"}
                            style={{width: "144px"}}
                            onChange={setMeasurementType}
                        />
                    </Label>
                </Space>
            </Col>
        </Row>
        <br/>
        <Row justify={"space-between"}>
            <Col span={24}>
                <TableLayout emptyText={"报警规则模板列表为空"}
                             permissions={[Permission.AlarmTemplateEdit, Permission.AlarmTemplateDelete]}
                             columns={columns}
                             dataSource={dataSource}/>
            </Col>
        </Row>
    </div>
}

export default AlarmRuleTemplate