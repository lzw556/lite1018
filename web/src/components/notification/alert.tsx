import useSocket, {SocketTopic} from "../../socket";
import {notification, Space} from "antd";
import {useEffect} from "react";

const AlertMessageNotification = () => {
    const {PubSub} = useSocket()
    const [api, contextHolder] = notification.useNotification();

    useEffect(() => {
        PubSub.subscribe(SocketTopic.deviceAlert, (msg: string, data: any) => {
            console.log(data)
            renderNotification(data)
        })
        return () => {
            PubSub.unsubscribe(SocketTopic.deviceAlert)
        }
    }, [])

    const renderNotification = (record: any) => {
        console.log(`notification ${record.device}`)
        switch (record.level) {
            case 1:
                api.info({
                    key: record.device.macAddress,
                    message: `提示报警`,
                    description: <div>{renderDescription(record)}</div>,
                })
                break
            case 2:
                api.warning({
                    key: record.device.macAddress,
                    message: `重要报警`,
                    description: <div>{renderDescription(record)}</div>,
                })
                break
            case 3:
                api.error({
                    key: record.device.macAddress,
                    message: `紧急报警`,
                    description: <div>{renderDescription(record)}</div>,
                })
                break
            default:
                api.success({
                    key: record.device.macAddress,
                    message: `恢复正常`,
                    description: <div>{renderDescription(record)}</div>,
                })
                break
        }
    }

    const renderDescription = (record:any) => {
        return <>
            <p>{`报警设备: ${record.device.name}`}</p>
            <p>{`报警属性: ${record.metric.name}`}</p>
            <p>{`报警值: ${record.value}`}</p>
        </>
    }

    return <div style={{position: "fixed", top: 0, right: 0, padding: "8px"}}>
        <Space direction={"vertical"}>
            {
                contextHolder
            }
        </Space>
    </div>
}

export default AlertMessageNotification