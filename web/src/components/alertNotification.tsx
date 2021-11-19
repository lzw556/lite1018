import useSocket from "../socket";
import {Button, message, notification, Space} from "antd";
import {useEffect} from "react";
import {ResponseResult} from "../types/response";
import {AcknowledgeAlarmRecordRequest} from "../apis/alarm";

const AlertNotification = () => {
    const {socket} = useSocket()

    const onAcknowledge = (id: number) => {
        AcknowledgeAlarmRecordRequest(id).then(res => {
            if (res.code === 200) {
                notification.close(String(id))
                message.success("确认报警成功").then()
            }else {
                message.error(res.msg).then()
            }
        })
    }

    useEffect(() => {
        if (socket) {
            socket.on("socket::alertNotification", (res: ResponseResult<any>) => {
                if (res.code === 200) {
                    renderAlertNotification(res.data)
                }
            })
        }
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