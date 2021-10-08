import {useEffect, useState} from "react";
import {ResponseResult} from "../types/response";

const io = require('socket.io-client')

const socket = io.connect("localhost:8081/", {
    transports: ["websocket"]
})

const useSocket = () => {
    const [connectionState, setConnectionState] = useState<any>()
    useEffect(() => {
        socket.on("ready", (data: any) => {
            console.log(data)
        })
        socket.on('deviceConnectionStateChanged', (res: ResponseResult<any>) => {
            if (res.code === 200) {
                console.log(res.data)
                setConnectionState({
                    id: res.data.id,
                    isOnline: res.data.connectionState.isOnline,
                    connectAt: res.data.connectionState.connectAt
                })
            }
        })
        return () => {
            if (socket) {
                socket.disconnect()
            }
        }
    }, [])
    return {
        connectionState
    }
}

export default useSocket