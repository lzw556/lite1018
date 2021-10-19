import {useEffect, useState} from "react";
import {ResponseResult} from "../types/response";

const io = require('socket.io-client')

const socket = io.connect("localhost:8081/", {
    transports: ["websocket"]
})

const useSocket = () => {
    const [connectionState, setConnectionState] = useState<any>()
    const [alertState, setAlertState] = useState<any>()
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
        socket.on("socket::alert", (res: ResponseResult<any>) => {
            if (res.code === 200) {
                console.log(res.data)
                setAlertState({
                    title: res.data.title,
                    content: res.data.content,
                    level: res.data.level,
                    data: res.data.data,
                })
            }
        })
        // return () => {
        //     if (socket) {
        //         socket.disconnect()
        //     }
        // }
    }, [])
    return {
        connectionState,
        alertState
    }
}

export default useSocket