import {Button, Popconfirm, Space, Tag, Typography} from "antd";
import {ColorHealth, ColorWarn} from "../../../constants/color";
import {Device} from "../../../types/device";
import {FC, useCallback, useEffect, useState} from "react";
import {PagingDevicesRequest} from "../../../apis/device";
import {Network} from "../../../types/network";
import {DeleteOutlined} from "@ant-design/icons";
import AlertIcon from "../../../components/alertIcon";
import DeviceUpgradeState from "../../../views/device/state/upgradeState";
import {PageResult} from "../../../types/page";
import {DeviceType} from "../../../types/device_type";
import {RemoveDevicesRequest} from "../../../apis/network";
import DeviceTable from "../../../components/table/deviceTable";
import usePermission, {Permission} from "../../../permission/permission";

export interface DeviceTableProps {
    network: Network
    onRefresh?: () => number
}

const DeviceList: FC<DeviceTableProps> = ({network, onRefresh}) => {
    const {hasPermission} = usePermission();
    const [dataSource, setDataSource] = useState<PageResult<any>>()
    const [refreshKey, setRefreshKey] = useState(0)

    const fetchDevices = useCallback((current: number, size: number) => {
        const filter = {
            network_id: network.id,
        }
        PagingDevicesRequest(current, size, filter).then(setDataSource)
    }, [onRefresh, refreshKey])

    useEffect(() => {
        fetchDevices(1, 10)
    }, [fetchDevices])

    const onDelete = (id: number) => {
        RemoveDevicesRequest(network.id, {device_ids: [id]}).then(_ => setRefreshKey(refreshKey + 1))
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
                    {
                        record.alertState && <AlertIcon popoverPlacement={"right"} state={record.alertState}/>
                    }
                    {
                        <a href={`#/device-management?locale=networks/deviceDetail&id=${record.id}`}>{text}</a>
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
                    {
                        hasPermission(Permission.NetworkRemoveDevices) && record.id !== network.gateway.id &&
                        <Popconfirm placement="left" title="确认要将该设备移除网络吗?" onConfirm={() => onDelete(record.id)}
                                    okText="移除" cancelText="取消">
                            <Button type="text" size="small" icon={<DeleteOutlined/>} danger disabled={isUpgrading}/>
                        </Popconfirm>
                    }
                </Space>
            },
        },
    ]

    return <>
        <DeviceTable columns={columns} permissions={[Permission.NetworkRemoveDevices]} dataSource={dataSource} onChange={fetchDevices}/>
    </>
}

export default DeviceList;