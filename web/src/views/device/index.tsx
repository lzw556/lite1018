import {Button, Col, Dropdown, Input, Menu, message, Popconfirm, Row, Select, Space, Spin, Tag, Typography} from "antd";
import {
    CaretDownOutlined,
    CodeOutlined,
    DeleteOutlined,
    EditOutlined,
    LoadingOutlined,
    PlusOutlined
} from "@ant-design/icons";
import {Content} from "antd/lib/layout/layout";
import {useHistory} from "react-router-dom";
import TableLayout, {TableProps} from "../layout/TableLayout";
import {useCallback, useEffect, useState} from "react";
import {DeviceCommand} from "../../types/device_command";
import {
    DeleteDeviceRequest,
    DeviceUpgradeRequest,
    GetDeviceRequest,
    PagingDevicesRequest,
    SendDeviceCommandRequest
} from "../../apis/device";
import {DeviceType, DeviceTypeString} from "../../types/device_type";
import EditSettingModal from "./edit/editSettingModal";
import {Device} from "../../types/device";
import EditBaseInfoModel from "./edit/editBaseInfoModel";
import {ColorHealth, ColorWarn} from "../../constants/color";
import Label from "../../components/label";
import ReplaceMacModal from "./replace/replaceMacModal";
import EditWsnSettingModal from "./edit/editWsnSettingModal";
import useSocket, {SocketTopic} from "../../socket";
import ShadowCard from "../../components/shadowCard";
import UpgradeModal from "./upgrade";
import "../../string-extension";
import DeviceUpgradeState from "./state/upgradeState";
import {IsUpgrading} from "../../types/device_upgrade_status";
import AssetSelect from "../../components/assetSelect";
import "../../assets/iconfont.css";
import AlertIcon from "../../components/alertIcon";
import MyBreadcrumb from "../../components/myBreadcrumb";
import _ from "lodash";
import HasPermission from "../../permission";
import usePermission, {Permission} from "../../permission/permission";

const {Search} = Input
const {Option} = Select
const {Text} = Typography

const DevicePage = () => {
    const [table, setTable] = useState<TableProps>({
        data: {result: []},
        isLoading: false,
        pagination: true,
        refreshKey: 0
    })
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
    const {PubSub} = useSocket()
    const {hasPermission, hasPermissions} = usePermission()

    useEffect(() => {
        PubSub.subscribe(SocketTopic.connectionState, (msg: string, state: any) => {
            if (state && table.data.result) {
                const data = _.cloneDeep(table.data)
                data.result.forEach((item: Device) => {
                    if (item.id === state.id) {
                        item.state.isOnline = state.isOnline
                    }
                })
                setTable({...table, data: data})
            }
        })
        PubSub.subscribe(SocketTopic.upgradeState, (msg: string, state: any) => {
            if (state && table.data.result) {
                const data = _.cloneDeep(table.data)
                data.result.forEach((item: Device) => {
                    if (item.id === state.id) {
                        item.upgradeState = state
                    }
                })
                setTable({...table, data: data})
            }
        })

        return () => {
            PubSub.unsubscribe(SocketTopic.connectionState)
            PubSub.unsubscribe(SocketTopic.upgradeState)
        }
    }, [table])

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
        PagingDevicesRequest(assetId, current, size, condition).then(data => {
            onLoading(false)
            setTable({...table, data: data})
        })
    }, [assetId, searchText])

    const onLoading = (isLoading: boolean) => {
        setTable({...table, isLoading: isLoading})
    }

    const onAddDevice = () => {
        history.push("/device-management?locale=addDevice")
    }

    const onDelete = (id: number) => {
        DeleteDeviceRequest(id).then(_ => onRefresh())
    }

    const onRefresh = () => {
        setTable({...table, refreshKey: table.refreshKey + 1})
    }

    const onCommand = (device: Device, key: any) => {
        switch (Number(key)) {
            case DeviceCommand.Upgrade:
                setDevice(device)
                setUpgradeVisible(true)
                break
            case DeviceCommand.CancelUpgrade:
                DeviceUpgradeRequest(device.id, {type: DeviceCommand.CancelUpgrade}).then(res => {
                    if (res.code === 200) {
                        message.success("取消升级成功").then()
                    } else {
                        message.error(`取消升级失败,${res.msg}`).then()
                    }
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
        const isUpgrading = record.upgradeState && IsUpgrading(record.upgradeState.status)
        return <Menu onClick={(e) => {
            onCommand(record, e.key)
        }}>
            {
                hasPermission(Permission.DeviceCommand) &&
                (<>
                    <Menu.Item key={DeviceCommand.Reboot} disabled={!disabled} hidden={isUpgrading}>重启</Menu.Item>
                    <Menu.Item key={DeviceCommand.Reset} disabled={!disabled} hidden={isUpgrading}>恢复出厂设置</Menu.Item>
                </>)
            }
            {
                hasPermissions(Permission.DeviceUpgrade, Permission.DeviceFirmwares) &&
                (<>
                    <Menu.Item key={DeviceCommand.Upgrade} disabled={!disabled} hidden={isUpgrading}>固件升级</Menu.Item>
                    <Menu.Item key={DeviceCommand.CancelUpgrade} hidden={!isUpgrading}>取消升级</Menu.Item>
                </>)
            }
        </Menu>
    }

    const onEdit = (id: number, key: any) => {
        GetDeviceRequest(id).then(data => {
            setDevice(data)
            setReplaceVisible(key === "0")
            setEditBaseInfoVisible(key === "1")
            setEditSettingVisible(key === "2")
            setEditWsnSettingVisible(key === "3")
        })
    }

    const renderEditMenus = (record: Device) => {
        const isUpgrading = record.upgradeState && IsUpgrading(record.upgradeState.status)
        return <Menu onClick={(e) => {
            onEdit(record.id, e.key)
        }} disabled={isUpgrading}>
            {
                hasPermission(Permission.DeviceReplace) && <Menu.Item key={0}>替换设备</Menu.Item>
            }
            {
                hasPermission(Permission.DeviceEdit) && <Menu.Item key={1}>编辑设备信息</Menu.Item>
            }
            {
                hasPermission(Permission.DeviceSettingsEdit) && record.typeId !== DeviceType.Router &&
                <Menu.Item key={2}>更新设备配置</Menu.Item>
            }
            {
                hasPermission(Permission.NetworkSettingEdit) && record.typeId === DeviceType.Gateway &&
                <Menu.Item key={3}>更新网络参数</Menu.Item>
            }
        </Menu>
    }

    const columns = [
        {
            title: '状态',
            dataIndex: 'state',
            key: 'state',
            render: (state: any) => {
                return <Space>
                    {
                        state && state.isOnline ? <Tag color={ColorHealth}>在线</Tag> : <Tag color={ColorWarn}>离线</Tag>
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
                    {
                        record.alertState && <AlertIcon popoverPlacement={"right"} state={record.alertState}/>
                    }
                    {
                        hasPermission(Permission.DeviceDetail) ?
                            <a href={`#/device-management?locale=devices/deviceDetail&id=${record.id}`}>{text}</a> : text
                    }
                    {
                        record.upgradeState && (
                            <DeviceUpgradeState status={record.upgradeState.status}
                                                progress={record.upgradeState.progress}/>)
                    }
                </Space>
            }
        },
        {
            title: 'MAC地址',
            dataIndex: 'macAddress',
            key: 'macAddress',
            render: (text: string) => {
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
                        <Button type="text" size="small" icon={<EditOutlined/>}
                                hidden={!(hasPermission(Permission.DeviceEdit) || hasPermission(Permission.DeviceSettingsEdit) || hasPermission(Permission.DeviceReplace) || hasPermission(Permission.NetworkSettingEdit))}/>
                    </Dropdown>
                    <Dropdown overlay={renderCommandMenus(record)}>
                        <Button type="text" icon={<CodeOutlined/>}
                                hidden={!(hasPermission(Permission.DeviceCommand) || hasPermissions(Permission.DeviceUpgrade, Permission.DeviceFirmwares))}/>
                    </Dropdown>
                    <HasPermission value={Permission.DeviceDelete}>
                        <Popconfirm placement="left" title="确认要删除该设备吗?" onConfirm={() => onDelete(record.id)}
                                    okText="删除" cancelText="取消">
                            <Button type="text" size="small" icon={<DeleteOutlined/>} danger disabled={isUpgrading}/>
                        </Popconfirm>
                    </HasPermission>
                </Space>
            },
        },
    ]

    return <Content>
        <MyBreadcrumb>
            <Space>
                {
                    hasPermission(Permission.DeviceAdd) &&
                    <Button type="primary" onClick={onAddDevice}>添加设备 <PlusOutlined/></Button>

                }
            </Space>
        </MyBreadcrumb>
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
                        permissions={[Permission.DeviceEdit, Permission.DeviceReplace, Permission.DeviceCommand, Permission.DeviceUpgrade, Permission.DeviceFirmwares, Permission.DeviceDelete, Permission.DeviceSettingsEdit, Permission.NetworkSettingEdit]}
                        isLoading={table.isLoading}
                        pagination={table.pagination}
                        refreshKey={table.refreshKey}
                        data={table.data}
                        onChange={onChange}
                    />
                </Col>
            </Row>
        </ShadowCard>
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
    </Content>
}

export default DevicePage