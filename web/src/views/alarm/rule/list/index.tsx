import TableLayout, {TableProps} from "../../../layout/TableLayout";
import {useCallback, useEffect, useState} from "react";
import {GetAlarmRuleRequest, PagingAlarmRulesRequest, RemoveAlarmRuleRequest} from "../../../../apis/alarm";
import {Device} from "../../../../types/device";
import {DeviceTypeString} from "../../../../types/device_type";
import {Button, Col, Divider, message, Popconfirm, Row, Select, Space} from "antd";
import Label from "../../../../components/label";
import AssetSelect from "../../../asset/select/assetSelect";
import {CaretDownOutlined, DeleteOutlined} from "@ant-design/icons";
import {PagingDevicesRequest} from "../../../../apis/device";
import EditModal from "../modal/editModal";
import {AlarmRule} from "../../../../types/alarm_rule";


const {Option} = Select

const RulesPage = () => {
    const [table, setTable] = useState<TableProps>({data: {}, isLoading: false, pagination: true, refreshKey: 0})
    const [assetId, setAssetId] = useState<number>(0)
    const [deviceId, setDeviceId] = useState<number>(0)
    const [rule, setRule] = useState<AlarmRule>()
    const [editVisible, setEditVisible] = useState<boolean>(false)
    const [devices, setDevices] = useState<Device[]>()

    const onAssetChanged = (value:any) => {
        setAssetId(value)
    }

    const onDeviceChanged = (value:any) => {
        setDeviceId(value)
    }

    const onLoadDevices = (open:any) => {
        if (open) {
            PagingDevicesRequest(assetId, 1, 100, {}).then(res => {
                if (res.code === 200) {
                    setDevices(res.data.result.filter(item => item.category === 3))
                }
            })
        }
    }

    const onRefresh = () => {
        setTable(Object.assign({}, table, {refreshKey: table.refreshKey + 1}))
    }

    const onEdit = (id:number) => {
        GetAlarmRuleRequest(id).then(res => {
            if (res.code === 200) {
                setRule(res.data)
                setEditVisible(true)
            }else {
                message.error(res.msg).then()
            }
        })
    }

    const onDelete = (id:number) => {
      RemoveAlarmRuleRequest(id).then(res => {
          if (res.code === 200) {
              message.success("删除成功").then()
              onRefresh()
          }else {
              message.error("删除失败").then()
          }
      })
    }

    const columns = [
        {
            title: '规则名称',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: '设备名称',
            dataIndex: 'device',
            key: 'device',
            render: (device: Device) => {
                return device.name
            }
        },
        {
            title: '设备类型',
            dataIndex: 'device',
            key: 'device',
            render: (device: Device) => {
                return DeviceTypeString(device.typeId)
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
            title: '操作',
            key: 'action',
            width: 200,
            render: (_: any, record: any) => {
                return <div>
                    <Button type={"link"} size={"small"} onClick={() => {
                        onEdit(record.id)
                    }}>修改阈值</Button>
                    <Divider type={"vertical"}/>
                    <Popconfirm placement="left" title="确认要删除该规则吗?" onConfirm={() => onDelete(record.id)}
                                okText="删除" cancelText="取消">
                        <Button type="text" size="small" danger>删除</Button>
                    </Popconfirm>
                </div>
            }
        }
    ]

    const onChange = useCallback((current: number, size: number) => {
        onLoading(true)
        PagingAlarmRulesRequest(assetId, deviceId, current, size).then(res => {
            if (res.code === 200) {
                setTable(Object.assign({}, table, {data: res.data}))
            }
        })
    }, [assetId, deviceId])

    const onLoading = (isLoading: boolean) => {
        setTable(Object.assign({}, table, {isLoading: isLoading}))
    }

    return <div>
        <Row justify={"start"}>
            <Col span={12}>
                <Space>
                    <Label name={"资产"}>
                        <AssetSelect bordered={false} style={{width: "150px"}} defaultValue={assetId}
                                     defaultActiveFirstOption={true}
                                     defaultOption={{value: 0, text: "所有资产"}} placeholder={"请选择资产"}
                                     onChange={onAssetChanged} suffixIcon={<CaretDownOutlined />}/>
                    </Label>
                    <Label name={"设备"}>
                        <Select bordered={false} style={{width: "150px"}} defaultValue={deviceId} placeholder={"请选择设备"} suffixIcon={<CaretDownOutlined />} onDropdownVisibleChange={onLoadDevices} onChange={onDeviceChanged}>
                            <Option value={0} key={0}>所有设备</Option>
                            {
                                devices?.map(item => (<Option key={item.id} value={item.id}>{item.name}</Option>))
                            }
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
        <EditModal rule={rule} visible={editVisible} onSuccess={() => {
            setEditVisible(false)
            onRefresh()
        }} onCancel={() => {
            setEditVisible(false)
        }}/>
    </div>
}

export default RulesPage