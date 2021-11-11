import {
    Button,
    Col,
    Dropdown,
    Input,
    Menu,
    message,
    Popconfirm,
    Popover,
    Row,
    Select,
    Space,
    Spin,
    Tag,
    Typography
} from "antd";
import {
    AppstoreAddOutlined,
    CaretDownOutlined,
    CodeOutlined,
    DeleteOutlined,
    EditOutlined,
    LoadingOutlined
} from "@ant-design/icons";
import {Content} from "antd/lib/layout/layout";
import {useHistory} from "react-router-dom";
import TableLayout, {TableProps} from "../layout/TableLayout";
import {useCallback, useState} from "react";
import {DeviceCommand} from "../../types/device_command";
import {
    DeleteDeviceRequest,
    DeviceCancelUpgradeRequest,
    GetDeviceRequest,
    PagingDevicesRequest,
    SendDeviceCommandRequest
} from "../../apis/device";
import {DeviceType, DeviceTypeString} from "../../types/device_type";
import EditSettingModal from "./edit/editSettingModal";
import {Device} from "../../types/device";
import EditBaseInfoModel from "./edit/editBaseInfoModel";
import {ColorDanger, ColorHealth, ColorWarn} from "../../constants/color";
import Label from "../../components/label";
import ReplaceMacModal from "./replace/replaceMacModal";
import EditWsnSettingModal from "./edit/editWsnSettingModal";
import useSocket from "../../socket";
import ShadowCard from "../../components/shadowCard";
import UpgradeModal from "./upgrade";
import "../../string-extension";
import DeviceUpgradeState from "./state/upgradeState";
import {IsUpgrading} from "../../types/device_upgrade_status";
import AssetSelect from "../../components/assetSelect";
import {GetFieldName} from "../../constants/field";

const {Search} = Input
const {Option} = Select
const {Text} =Typography

const DevicePage = () => {
    const [table, setTable] = useState<TableProps>({data: {}, isLoading: false, pagination: true, refreshKey: 0})
    const history = useHistory()
    const [assetId, setAssetId] = useState<number>(0)
    const [searchTarget, setSearchTarget] = useState<number>(0)
    const [searchText, setSearchText] = useState<string>("")
    const [device, setDevice] = useState<Device>()
    const [editWsnSettingVisible, setEditWsnSettingVisible] = useState<boolean>(false)
    const [editSettingVisible, setEditSettingVisible] = useState<boolean>(false)
    const [editBaseInfoVisible, setEditBaseInfoVisible] = useState<boolean>(false)
    const [upgradeVisible, setUpgradeVisible] = useState<boolean>(false)
    const [replaceVisible, setReplaceVisible] = useState<boolean>(false)
    const [executeDevice, setExecuteDevice] = useState<Device>()
    const {connectionState, upgradeState} = useSocket()

    const onAssetChange = (value: number) => {
        setAssetId(value)
    }

    const onSearch = (value: string) => {
        setSearchText(value)
    }

    const onTargetChange = (value: number) => {
        setSearchTarget(value)
    }

    const onChange = useCallback((current: number, size: number) => {
        onLoading(true)
        const condition = {
            target: searchTarget === 0 ? "name" : "mac_address",
            text: searchText
        }
        PagingDevicesRequest(assetId, current, size, condition).then(res => {
            onLoading(false)
            if (res.code === 200) {
                setTable(Object.assign({}, table, {data: res.data}))
            }
        })
    }, [assetId, searchText])

    const onLoading = (isLoading: boolean) => {
        setTable(Object.assign({}, table, {isLoading: isLoading}))
    }

    const onAddDevice = () => {
        history.push("/device-management/add")
    }

    const onDelete = (id: number) => {
        DeleteDeviceRequest(id).then(res => {
            if (res.code === 200) {
                message.success("删除成功").then()
                onRefresh()
            } else {
                message.error(`删除失败,${res.msg}`).then()
            }
        })
    }

    const onRefresh = () => {
        setTable(Object.assign({}, table, {refreshKey: table.refreshKey + 1}))
    }

    const onCommand = (device: Device, key: any) => {
        switch (Number(key)) {
            case DeviceCommand.Upgrade:
                setDevice(device)
                setUpgradeVisible(true)
                break
            case DeviceCommand.CancelUpgrade:
                DeviceCancelUpgradeRequest(device.id).then(res => {
                    console.log(res)
                })
                break
            default:
                setExecuteDevice(device)
                SendDeviceCommandRequest(device.id, key).then(res => {
                    setExecuteDevice(undefined)
                    if (res.code === 200) {
                        message.success("命令发送成功").then()
                    } else {
                        message.error(res.msg).then()
                    }
                })
                break
        }
    }

    const renderCommandMenus = (record: Device) => {
        const disabled = record.state && record.state.isOnline
        const isUpgrading = upgradeState && IsUpgrading(upgradeState.status)
        return <Menu onClick={(e) => {
            onCommand(record, e.key)
        }}>
            <Menu.Item key={DeviceCommand.Reboot} disabled={!disabled} hidden={isUpgrading}>重启</Menu.Item>
            <Menu.Item key={DeviceCommand.Upgrade} disabled={!disabled} hidden={isUpgrading}>固件升级</Menu.Item>
            <Menu.Item key={DeviceCommand.CancelUpgrade} hidden={!isUpgrading}>取消升级</Menu.Item>
            <Menu.Item key={DeviceCommand.Reset} disabled={!disabled} hidden={isUpgrading}>恢复出厂设置</Menu.Item>
        </Menu>
    }

    const onEdit = (id: number, key: any) => {
        GetDeviceRequest(id).then(res => {
            if (res.code === 200) {
                setDevice(res.data)
                setReplaceVisible(key === "0")
                setEditBaseInfoVisible(key === "1")
                setEditSettingVisible(key === "2")
                setEditWsnSettingVisible(key === "3")
            } else {
                message.error(res.msg).then()
            }
        })
    }

    const renderEditMenus = (record: Device) => {
        const isUpgrading = record.upgradeState && IsUpgrading(record.upgradeState.status)
        return <Menu onClick={(e) => {
            onEdit(record.id, e.key)
        }} disabled={isUpgrading}>
            <Menu.Item key={0}>替换设备</Menu.Item>
            <Menu.Item key={1}>编辑设备信息</Menu.Item>
            {record.typeId !== DeviceType.Router && <Menu.Item key={2}>更新设备配置</Menu.Item>}
            {record.typeId === DeviceType.Gateway && <Menu.Item key={3}>更新网络参数</Menu.Item>}
        </Menu>
    }

    const columns = [
        {
            title: '状态',
            dataIndex: 'state',
            key: 'state',
            render: (state: any, record:any) => {
                if (connectionState) {
                    state = connectionState
                }
                return <Space>
                    {
                        state && state.isOnline ? <Tag color={ColorHealth}>在线</Tag> : <Tag color={ColorWarn}>离线</Tag>
                    }
                    {
                        record.alertState && record.alertState.level === 3 && <Popover content={record.alertState.content.replace(record.alertState.alarm.field, GetFieldName(record.alertState.alarm.field))}>
                            <Tag color={ColorDanger}>报警</Tag>
                        </Popover>
                    }
                </Space>
            }
        },
        {
            title: '设备名称',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: Device) => {
                return <Space>
                    <Spin indicator={<LoadingOutlined/>}
                          size={"small"}
                          spinning={executeDevice ? executeDevice.id === record.id : false}/>
                    <a href={`#/device-management/devices?locale=deviceDetail&id=${record.id}`}>{text}</a>
                    {
                        upgradeState && upgradeState.id == record.id && (<DeviceUpgradeState status={upgradeState.status} progress={upgradeState.progress}/>)
                    }
                </Space>
            }
        },
        {
            title: 'MAC地址',
            dataIndex: 'macAddress',
            key: 'macAddress',
            render: (text:string) => {
                return <Text>
                    {
                        text.toUpperCase().macSeparator()
                    }
                </Text>
            }
        },
        {
            title: '设备类型',
            dataIndex: 'typeId',
            key: 'typeId',
            render: (text: DeviceType) => {
                return DeviceTypeString(text)
            }
        },
        {
            title: '电池电压(mV)',
            dataIndex: 'state',
            key: 'batteryVoltage',
            render: (state: any) => {
                return state ? state.batteryVoltage : 0
            }
        },
        {
            title: '信号强度(dB)',
            dataIndex: 'state',
            key: 'signalLevel',
            render: (state: any) => {
                return <div>{state ? state.signalLevel : 0}</div>
            }
        },
        {
            title: '操作',
            key: 'action',
            render: (text: any, record: any) => {
                const isUpgrading = record.upgradeState && record.upgradeState.status >= 1 && record.upgradeState.status <= 3
                return <Space>
                    <Dropdown overlay={renderEditMenus(record)}>
                        <Button type="text" size="small" icon={<EditOutlined/>}/>
                    </Dropdown>
                    <Dropdown overlay={renderCommandMenus(record)}>
                        <Button type="text" icon={<CodeOutlined/>}/>
                    </Dropdown>
                    <Popconfirm placement="left" title="确认要删除该设备吗?" onConfirm={() => onDelete(record.id)}
                                okText="删除" cancelText="取消">
                        <Button type="text" size="small" icon={<DeleteOutlined/>} danger disabled={isUpgrading}/>
                    </Popconfirm>
                </Space>
            },
        },
    ]

    return <div>
        <Row justify="center">
            <Col span={24} style={{textAlign: "right"}}>
                <Space>
                    <Button type="primary" onClick={onAddDevice}>添加设备 <AppstoreAddOutlined/></Button>
                </Space>
            </Col>
        </Row>
        <Row justify="center">
            <Col span={24}>
                <Content style={{paddingTop: "15px"}}>
                    <ShadowCard>
                        <Row justify="center">
                            <Col span={24}>
                                <Space>
                                    <Label name={"资产"}>
                                        <AssetSelect bordered={false} style={{width: "120px"}} defaultValue={assetId}
                                                     defaultActiveFirstOption={true}
                                                     placeholder={"请选择资产"}
                                                     onChange={onAssetChange} suffixIcon={<CaretDownOutlined/>}>
                                            <Option key={0} value={0}>所有资产</Option>
                                        </AssetSelect>
                                    </Label>
                                    <Input.Group compact>
                                        <Select defaultValue={searchTarget} style={{width: "80px"}}
                                                onChange={onTargetChange} suffixIcon={<CaretDownOutlined/>}>
                                            <Option value={0}>名称</Option>
                                            <Option value={1}>MAC</Option>
                                        </Select>
                                        <Search style={{width: "256px"}} placeholder={
                                            searchTarget === 0 ? "请输入设备名称进行查询" : "请输入设备MAC进行查询"
                                        }
                                                onSearch={onSearch}
                                                allowClear
                                                enterButton/>
                                    </Input.Group>
                                </Space>
                            </Col>
                        </Row>
                        <br/>
                        <Row justify="center">
                            <Col span={24}>
                                <TableLayout
                                    emptyText={"设备列表为空"}
                                    columns={columns}
                                    isLoading={table.isLoading}
                                    pagination={table.pagination}
                                    refreshKey={table.refreshKey}
                                    data={table.data}
                                    onChange={onChange}
                                />
                            </Col>
                        </Row>
                    </ShadowCard>
                </Content>
            </Col>
        </Row>
        <ReplaceMacModal visible={replaceVisible} device={device} onCancel={() => {
            setDevice(undefined)
            setReplaceVisible(false)
        }} onSuccess={() => {
            onRefresh()
            setDevice(undefined)
            setReplaceVisible(false)
        }}/>
        <EditBaseInfoModel device={device} visible={editBaseInfoVisible} onSuccess={() => {
            onRefresh()
            setDevice(undefined)
            setEditBaseInfoVisible(false)
        }} onCancel={() => {
            setDevice(undefined)
            setEditBaseInfoVisible(false)
        }}/>
        <EditSettingModal device={device} visible={editSettingVisible} onSuccess={() => {
            setDevice(undefined)
            setEditSettingVisible(false)
        }} onCancel={() => {
            setDevice(undefined)
            setEditSettingVisible(false)
        }}/>
        <EditWsnSettingModal visible={editWsnSettingVisible} device={device} onSuccess={() => {
            setDevice(undefined)
            setEditWsnSettingVisible(false)
        }} onCancel={() => {
            setDevice(undefined)
            setEditWsnSettingVisible(false)
        }}/>
        <UpgradeModal visible={upgradeVisible} device={device} onSuccess={() => {
            setDevice(undefined)
            setUpgradeVisible(false)
        }} onCancel={() => {
            setDevice(undefined)
            setUpgradeVisible(false)
        }}/>
    </div>
}

export default DevicePage