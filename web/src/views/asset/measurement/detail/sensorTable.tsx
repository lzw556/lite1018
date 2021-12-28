import {Measurement} from "../../../../types/measurement";
import {FC, useEffect, useState} from "react";
import {GetDevicesRequest} from "../../../../apis/device";
import {Device} from "../../../../types/device";
import TableLayout from "../../../layout/TableLayout";
import {Space, Tag, Typography} from "antd";
import {ColorHealth, ColorWarn} from "../../../../constants/color";
import "../../../../string-extension"
import {MeasurementType} from "../../../../types/measurement_type";
import moment from "moment";
import AddDeviceModal from "./addDeviceModal";

export interface SensorTableProps {
    measurement: Measurement;
}

const SensorTable:FC<SensorTableProps> = ({measurement}) => {
    const [dataSource, setDataSource] = useState<Device[]>([]);
    const [visible, setVisible] = useState<boolean>(false);

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
            title: '传感器名称',
            dataIndex: 'name',
            key: 'name',
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
    ]

    useEffect(() => {
        GetDevicesRequest({measurement_id: measurement.id, category:3}).then(setDataSource)
    }, [measurement])

    const renderColumns = () => {
        switch (measurement.type) {
            case MeasurementType.BoltLoosening:
                return [
                    ...columns,
                    {
                        title: "松动角度",
                        dataIndex: "data",
                        key: "data",
                        render: (data: any) => {
                            return data && data.values ? `${data.values[0]}°` : "-"
                        }
                    },
                    {
                        title: "上报时间",
                        dataIndex: "data",
                        key: "data",
                        render: (data: any) => {
                            return data && data.values ? moment.unix(data.timestamp).local().format("YYYY-MM-DD HH:mm:ss") : "-"
                        }
                    }
                ]
            case MeasurementType.FlangeLoosening:
                return columns
            default:
                return columns
        }
    }

    return <>
        <TableLayout emptyText={<span>传感器列表为空 <a onClick={() => setVisible(true)}>去绑定</a></span>} columns={renderColumns()} dataSource={dataSource}/>
        {
            measurement && <AddDeviceModal measurement={measurement}
                                           visible={visible}
                                           onCancel={() => setVisible(false)}
                                           onSuccess={() => setVisible(false)}/>
        }
    </>
}

export default SensorTable