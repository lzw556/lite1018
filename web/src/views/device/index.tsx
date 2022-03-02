import {Button, Col, Dropdown, Input, Menu, message, Popconfirm, Row, Select, Space, Spin, Tag, Typography} from "antd";
import {
    CaretDownOutlined,
    CodeOutlined,
    DeleteOutlined,
    EditOutlined,
    LoadingOutlined, MonitorOutlined, PlusOutlined
} from "@ant-design/icons";
import {Content} from "antd/lib/layout/layout";
import {useCallback, useEffect, useState} from "react";
import {DeviceCommand} from "../../types/device_command";
import {
    DeleteDeviceRequest,
    DeviceUpgradeRequest,
    GetDeviceRequest,
    PagingDevicesRequest,
    SendDeviceCommandRequest
} from "../../apis/device";
import {DeviceType} from "../../types/device_type";
import EditSettingModal from "./edit/editSettingModal";
import {Device} from "../../types/device";
import EditBaseInfoModel from "./edit/editBaseInfoModel";
import {ColorHealth, ColorWarn} from "../../constants/color";
import Label from "../../components/label";
import ReplaceMacModal from "./replace/replaceMacModal";
import ShadowCard from "../../components/shadowCard";
import UpgradeModal from "./upgrade";
import "../../string-extension";
import {IsUpgrading} from "../../types/device_upgrade_status";
import "../../assets/iconfont.css";
import AlertIcon from "../../components/alertIcon";
import MyBreadcrumb from "../../components/myBreadcrumb";
import HasPermission from "../../permission";
import usePermission, {Permission} from "../../permission/permission";
import {PageResult} from "../../types/page";
import DeviceTable from "../../components/table/deviceTable";
import NetworkSelect from "../../components/select/networkSelect";
import DeviceMonitorDrawer from "./deviceMonitorDrawer";
import DeviceUpgradeSpin from "./spin/deviceUpgradeSpin";
import { isMobile } from "../../utils/deviceDetection";

const {Search} = Input
const {Option} = Select
const {Text} = Typography

const DevicePage = () => {
    const [network, setNetwork] = useState<number>()
    const [searchTarget, setSearchTarget] = useState<number>(0)
    const [searchText, setSearchText] = useState<string>("")
    const [device, setDevice] = useState<Device>()
    const [editSettingVisible, setEditSettingVisible] = useState<boolean>(false)
    const [editBaseInfoVisible, setEditBaseInfoVisible] = useState<boolean>(false)
    const [monitorVisible, setMonitorVisible] = useState<boolean>(false)
    const [upgradeVisible, setUpgradeVisible] = useState<boolean>(false)
    const [replaceVisible, setReplaceVisible] = useState<boolean>(false)
    const [executeDevice, setExecuteDevice] = useState<Device>()
    const [dataSource, setDataSource] = useState<PageResult<any>>()
    const {hasPermission, hasPermissions} = usePermission()
    const [refreshKey, setRefreshKey] = useState<number>(0)

    const onSearch = (value: string) => {
        setSearchText(value)
    }

    const onTargetChange = (value: number) => {
        setSearchTarget(value)
    }

    const fetchDevices = useCallback((current: number, size: number) => {
        const filter: any = {}
        if (searchTarget === 0) {
            filter.name = searchText
        } else if (searchTarget === 1) {
            filter.mac_address = searchText
        }
        if (network) {
            filter.network_id = network
        }
        PagingDevicesRequest(current, size, filter).then(setDataSource)
    }, [network, searchText, refreshKey])

    useEffect(() => {
        fetchDevices(1, 10)
    }, [fetchDevices])

    useEffect(() => {
        document.onkeyup = (e) => {
            if (e.keyCode === 27) {
                setMonitorVisible(false)
            }
        }
    }, [])


    const onRefresh = () => {
        setRefreshKey(refreshKey + 1)
    }

    const onDelete = (id: number) => {
        DeleteDeviceRequest(id).then(_ => onRefresh())
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
        const isUpgrading = record.upgradeStatus && IsUpgrading(record.upgradeStatus.code)
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
        })
    }

    const onMonitor = (id: number) => {
        GetDeviceRequest(id).then(data => {
            setDevice(data)
            setMonitorVisible(true)
        })
    }

    const renderEditMenus = (record: Device) => {
        const isUpgrading = record.upgradeStatus && IsUpgrading(record.upgradeStatus.code)
        return <Menu onClick={(e) => {
            onEdit(record.id, e.key)
        }} disabled={isUpgrading}>
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
            },
            fixed:isMobile,
            width: isMobile ? 60 :''
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
                        record.upgradeStatus && (
                            <DeviceUpgradeSpin status={record.upgradeStatus}/>)
                    }
                </Space>
            },
            fixed: isMobile,
            width: isMobile?150:''
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
                const isUpgrading = record.upgradeStatus && IsUpgrading(record.upgradeStatus.code)
                return <Space>
                    {
                        record.typeId !== DeviceType.Router && record.typeId !== DeviceType.Gateway &&
                        <Button type={"text"} size={"small"} onClick={_ => onMonitor(record.id)}>
                            <MonitorOutlined />
                        </Button>
                    }
                    <Dropdown overlay={renderEditMenus(record)}>
                        <Button type="text" size="small" icon={<EditOutlined/>}
                                hidden={!(hasPermission(Permission.DeviceEdit) || hasPermission(Permission.DeviceSettingsEdit))}/>
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
                <Button type={"primary"} href={"#/device-management?locale=devices/addDevice"}>添加设备<PlusOutlined/></Button>
            </Space>
        </MyBreadcrumb>
        <ShadowCard>
            <Row justify="center">
                <Col span={24}>
                    <Space wrap={true}>
                        <Label name={"网络"}>
                            <NetworkSelect bordered={false} onChange={setNetwork} allowClear/>
                        </Label>
                        <Input.Group compact>
                            <Select defaultValue={searchTarget} style={{width: "70px"}}
                                    onChange={onTargetChange} suffixIcon={<CaretDownOutlined/>}>
                                <Option value={0}>名称</Option>
                                <Option value={1}>MAC</Option>
                            </Select>
                            <Search style={{width:!isMobile? "256px":'70%'}} placeholder={
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
                    <DeviceTable columns={columns}
                                 permissions={[Permission.DeviceEdit, Permission.DeviceSettingsEdit, Permission.DeviceCommand, Permission.DeviceDelete]}
                                 dataSource={dataSource}
                                 onChange={fetchDevices}/>
                </Col>
            </Row>
        </ShadowCard>
        <ReplaceMacModal visible={replaceVisible} device={device} onCancel={() => {
            setDevice(undefined)
            setReplaceVisible(false)
        }} onSuccess={() => {
            setDevice(undefined)
            setReplaceVisible(false)
            onRefresh()
        }}/>
        <EditBaseInfoModel device={device} visible={editBaseInfoVisible} onSuccess={() => {
            setDevice(undefined)
            setEditBaseInfoVisible(false)
            onRefresh()
        }} onCancel={() => {
            setDevice(undefined)
            setEditBaseInfoVisible(false)
        }}/>
        {
            device &&
            <EditSettingModal device={device} visible={editSettingVisible} onSuccess={() => {
                setDevice(undefined)
                setEditSettingVisible(false)
                onRefresh()
            }} onCancel={() => {
                setDevice(undefined)
                setEditSettingVisible(false)
            }}/>
        }
        {
            device &&
            <UpgradeModal visible={upgradeVisible} device={device} onSuccess={() => {
                setDevice(undefined)
                setUpgradeVisible(false)
            }} onCancel={() => {
                setDevice(undefined)
                setUpgradeVisible(false)
            }}/>
        }
        {
            device && <DeviceMonitorDrawer device={device} visible={monitorVisible} onClose={()=> isMobile && setMonitorVisible(false)}/>
        }
    </Content>
}

export default DevicePage