import {Button, Dropdown, Menu, message, Popconfirm, Space, Spin, Tag, Typography} from "antd";
import {ColorHealth, ColorWarn} from "../../../constants/color";
import {Device} from "../../../types/device";
import {FC, useCallback, useEffect, useState} from "react";
import {
    DeviceUpgradeRequest, GetDeviceRequest,
    PagingDevicesRequest,
    SendDeviceCommandRequest
} from "../../../apis/device";
import {Network} from "../../../types/network";
import {CodeOutlined, DeleteOutlined, EditOutlined, LoadingOutlined} from "@ant-design/icons";
import AlertIcon from "../../../components/alertIcon";
import usePermission, {Permission} from "../../../permission/permission";
import DeviceUpgradeState from "../../../views/device/state/upgradeState";
import TableLayout from "../../../views/layout/TableLayout";
import HasPermission from "../../../permission";
import {DeviceCommand} from "../../../types/device_command";
import {IsUpgrading} from "../../../types/device_upgrade_status";
import useSocket, {SocketTopic} from "../../../socket";
import ReplaceMacModal from "../../../views/device/replace/replaceMacModal";
import EditBaseInfoModel from "../../../views/device/edit/editBaseInfoModel";
import EditSettingModal from "../../../views/device/edit/editSettingModal";
import EditWsnSettingModal from "../../../views/device/edit/editWsnSettingModal";
import UpgradeModal from "../../../views/device/upgrade";
import _ from "lodash";
import {PageResult} from "../../../types/page";
import {DeviceType} from "../../../types/device_type";
import {RemoveDevicesRequest} from "../../../apis/network";

export interface DeviceTableProps {
    network: Network
}

const DeviceTable:FC<DeviceTableProps> = ({network}) => {
    const [executeDevice, setExecuteDevice] = useState<Device>()
    const [device, setDevice] = useState<Device>()
    const [editWsnSettingVisible, setEditWsnSettingVisible] = useState<boolean>(false)
    const [editSettingVisible, setEditSettingVisible] = useState<boolean>(false)
    const [editBaseInfoVisible, setEditBaseInfoVisible] = useState<boolean>(false)
    const [upgradeVisible, setUpgradeVisible] = useState<boolean>(false)
    const [replaceVisible, setReplaceVisible] = useState<boolean>(false)
    const {PubSub} = useSocket()
    const {hasPermission, hasPermissions} = usePermission()
    const [dataSource, setDataSource] = useState<PageResult<any>>()

    useEffect(() => {
        PubSub.subscribe(SocketTopic.connectionState, (msg: string, state: any) => {
            if (state && dataSource) {
                const newDataSource = _.cloneDeep(dataSource)
                newDataSource.result.forEach((item: Device) => {
                    if (item.id === state.id) {
                        item.state.isOnline = state.isOnline
                    }
                })
                setDataSource(newDataSource)
            }
        })
        PubSub.subscribe(SocketTopic.upgradeState, (msg: string, state: any) => {
            if (state && dataSource) {
                const newDataSource = _.cloneDeep(dataSource)
                newDataSource.result.forEach((item: Device) => {
                    if (item.id === state.id) {
                        item.upgradeState = state
                    }
                })
                setDataSource(newDataSource)
            }
        })

        return () => {
            PubSub.unsubscribe(SocketTopic.connectionState)
            PubSub.unsubscribe(SocketTopic.upgradeState)
        }
    }, [dataSource])

    const fetchDevices = useCallback((current: number, size: number) => {
        const filter = {
            network_id: network.id,
            asset_id: network.asset.id
        }
        PagingDevicesRequest(current, size, filter).then(setDataSource)
    }, [])

    useEffect(() => {
        fetchDevices(1, 10)
    }, [fetchDevices])

    const onDelete = (id: number) => {
        RemoveDevicesRequest(network.id, {device_ids: [id]}).then()
    }

    const onRefresh = () => {
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
                            <a href={`#/device-management?locale=networks/deviceDetail&id=${record.id}`}>{text}</a> : text
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
                return <Typography.Text>
                    {
                        text.toUpperCase().macSeparator()
                    }
                </Typography.Text>
            }
        },
        {
            title: '设备类型',
            dataIndex: 'typeId',
            key: 'typeId',
            render: (text: DeviceType) => {
                return DeviceType.toString(text)
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
                        {
                            record.id !== network.gateway.id &&
                            <Popconfirm placement="left" title="确认要将该设备移除网络吗?" onConfirm={() => onDelete(record.id)}
                                        okText="删除" cancelText="取消">
                                <Button type="text" size="small" icon={<DeleteOutlined/>} danger disabled={isUpgrading}/>
                            </Popconfirm>
                        }
                    </HasPermission>
                </Space>
            },
        },
    ]

    return <>
        <TableLayout
            emptyText={"设备列表为空"}
            columns={columns}
            permissions={[Permission.DeviceEdit, Permission.DeviceReplace, Permission.DeviceCommand, Permission.DeviceUpgrade, Permission.DeviceFirmwares, Permission.DeviceDelete, Permission.DeviceSettingsEdit, Permission.NetworkSettingEdit]}
            dataSource={dataSource}
            onPageChange={fetchDevices}
        />
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
    </>
}

export default DeviceTable;