import {useEffect} from "react";
import {ResponseResult} from "../types/response";
import {isLogin} from "../utils/session";

const io = require('socket.io-client')
const PubSub = require('pubsub-js')

let socket: any = null

export const SocketTopic = {
    connectionState: "connectionState",
    upgradeState: "upgradeState",
    alert: "alert"
}

const useSocket = () => {

    if (isLogin()) {
        if (!socket) {
            socket = io.connect(":8291/", {
                transports: ["websocket"]
            })
        }
    }

    useEffect(() => {
        if (socket) {
            socket.on("ready", (data: any) => {
                console.log(data)
            })
            socket.on('socket::deviceConnectionStateChanged', (res: ResponseResult<any>) => {
                if (res.code === 200) {
                    PubSub.publish(SocketTopic.connectionState, {
                        id: res.data.id,
                        isOnline: res.data.connectionState.isOnline,
                        connectAt: res.data.connectionState.connectAt
                    })
                }
            })
            socket.on('socket::deviceUpgradeStateChanged', (res: ResponseResult<any>) => {
                if (res.code === 200) {
                    PubSub.publish(SocketTopic.upgradeState, {
                        id: res.data.id,
                        status: res.data.upgradeState.status,
                        progress: res.data.upgradeState.progress,
                    })
                }
            })
            socket.on("socket::alertNotification", (res: ResponseResult<any>) => {
                if (res.code === 200) {
                    PubSub.publish(SocketTopic.alert, res.data)
                }
            })
        }
    }, [socket])
    return {
        PubSub
    }
}

export default useSocket