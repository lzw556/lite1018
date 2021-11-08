import {useEffect, useState} from "react";
import {ResponseResult} from "../types/response";

const io = require('socket.io-client')

const socket = io.connect(":8291/", {
    transports: ["websocket"]
})

const useSocket = () => {
    const [connectionState, setConnectionState] = useState<any>()
    const [alertState, setAlertState] = useState<any>()
    const [upgradeState, setUpgradeState] = useState<any>()

    useEffect(() => {
        socket.on("ready", (data: any) => {
            console.log(data)
        })
        socket.on('socket::deviceConnectionStateChanged', (res: ResponseResult<any>) => {
            if (res.code === 200) {
                setConnectionState({
                    id: res.data.id,
                    isOnline: res.data.connectionState.isOnline,
                    connectAt: res.data.connectionState.connectAt
                })
            }
        })
        socket.on('socket::deviceUpgradeStateChanged', (res: ResponseResult<any>) => {
            if (res.code == 200) {
                setUpgradeState({
                    id: res.data.id,
                    status: res.data.upgradeState.status,
                    progress: res.data.upgradeState.progress,
                })
            }
        })
        socket.on("socket::alert", (res: ResponseResult<any>) => {
            if (res.code === 200) {
                setAlertState({
                    title: res.data.title,
                    content: res.data.content,
                    field: res.data.field,
                    level: res.data.level,
                    data: res.data.data,
                })
            }
        })
    }, [])
    return {
        connectionState,
        upgradeState,
        alertState
    }
}

export default useSocket