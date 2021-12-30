import TableLayout from "../../views/layout/TableLayout";
import {FC, useEffect, useState} from "react";
import useSocket, {SocketTopic} from "../../socket";
import _ from "lodash";
import {Device} from "../../types/device";

export interface DeviceTableProps {
    columns?: any
    dataSource?: any
    permissions?: any
    emptyText?: any
    onChange?: any
}

const DeviceTable:FC<DeviceTableProps> = ({columns, emptyText, dataSource, permissions, onChange}) => {
    const {PubSub} = useSocket()
    const [data, setData] = useState<any>(dataSource)

    useEffect(() => {
        setData(dataSource)
    }, [dataSource])

    useEffect(() => {
        PubSub.subscribe(SocketTopic.connectionState, (msg: string, state: any) => {
            if (state && data) {
                const newData = _.cloneDeep(data)
                newData.result.forEach((item: Device) => {
                    if (item.id === state.id) {
                        item.state.isOnline = state.isOnline
                    }
                })
                setData(newData)
            }
        })
        PubSub.subscribe(SocketTopic.upgradeState, (msg: string, state: any) => {
            console.log(state)
            if (state && data) {
                const newData = _.cloneDeep(data)
                newData.result.forEach((item: Device) => {
                    if (item.id === state.id) {
                        item.upgradeState = state
                    }
                })
                setData(newData)
            }
        })

        return () => {
            PubSub.unsubscribe(SocketTopic.connectionState)
            PubSub.unsubscribe(SocketTopic.upgradeState)
        }
    }, [data])

    return <TableLayout
        emptyText={emptyText ? emptyText : "设备列表为空"}
        columns={columns}
        permissions={permissions}
        dataSource={data}
        onPageChange={onChange}
    />
}

export default DeviceTable;