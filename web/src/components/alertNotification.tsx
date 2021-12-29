import useSocket, {SocketTopic} from "../socket";
import {Button, notification, Space} from "antd";
import {useEffect} from "react";

const AlertNotification = () => {
    const {PubSub} = useSocket()

    const onAcknowledge = (id: number) => {

    }

    useEffect(() => {
        PubSub.subscribe(SocketTopic.alert, (msg: string, data: any) => {
            renderAlertNotification(data)
        })
    }, [])

    const renderButtons = (id: number) => {
        return <Space>
            <Button type={"link"} size={"small"} onClick={() => onAcknowledge(id)}>标记为已处理</Button>
            <Button type={"text"} size={"small"} onClick={() => notification.close(String(id))}>忽略</Button>
        </Space>
    }

    const renderAlertNotification = (alert: any) => {
        switch (alert.level) {
            case 1:
                notification.info({
                    key: String(alert.sourceId),
                    message: alert.title,
                    description: alert.message,
                    btn: renderButtons(alert.sourceId)
                })
                break
            case 2:
                notification.warning({
                    key: String(alert.sourceId),
                    message: alert.title,
                    description: alert.message,
                    btn: renderButtons(alert.sourceId)
                })
                break
            case 3:
                notification.error({
                    key: String(alert.sourceId),
                    message: alert.title,
                    description: alert.message,
                    duration: null,
                    btn: renderButtons(alert.sourceId)
                })
                break
            default:
                notification.success({
                    key: String(alert.sourceId),
                    message: alert.title,
                    description: alert.message,
                })
                break
        }
    }

    return <div style={{position: "fixed", top: 0, right: 0, padding: "8px"}}>
        <Space direction={"vertical"}>
        </Space>
    </div>
}

export default AlertNotification