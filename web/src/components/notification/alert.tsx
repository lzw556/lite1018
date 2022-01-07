import useSocket, {SocketTopic} from "../../socket";
import {Button, notification, Space} from "antd";
import {useEffect} from "react";
import {getRuleMethodString} from "../../types/alarm_rule_template";

const AlertMessageNotification = () => {
    const {PubSub} = useSocket()
    const [api, contextHolder] = notification.useNotification();

    const onAcknowledge = (id: number) => {

    }

    useEffect(() => {
        PubSub.subscribe(SocketTopic.alert, (msg: string, data: any) => {
            console.log(data)
            renderNotification(data.alarmRecord)
        })
        return () => {
            PubSub.unsubscribe(SocketTopic.alert)
        }
    }, [])

    const renderButtons = (id: number) => {
        return <Space>
            <Button type={"link"} size={"small"} onClick={() => onAcknowledge(id)}>标记为已处理</Button>
            <Button type={"text"} size={"small"} onClick={() => notification.close(String(id))}>忽略</Button>
        </Space>
    }

    const renderNotification = (record: any) => {
        switch (record.level) {
            case 1:
                api.info({
                    key: String(record.id),
                    message: `${record.measurement.name}报警`,
                    description: <div>{renderDescription(record)}</div>,
                })
                break
            case 2:
                api.warning({
                    key: String(record.id),
                    message: `${record.measurement.name}报警`,
                    description: <div>{renderDescription(record)}</div>,
                })
                break
            case 3:
                api.error({
                    key: String(record.id),
                    message: `${record.measurement.name}报警`,
                    description: <div>{renderDescription(record)}</div>,
                })
                break
            default:
                api.success({
                    key: String(record.id),
                    message: `${record.measurement.name}报警`,
                    description: <div>{renderDescription(record)}</div>,
                })
                break
        }
    }

    const renderDescription = (record:any) => {
        return <>
            <p>{`报警属性: ${record.field.title}`}</p>
            <p>{`统计方式: ${getRuleMethodString(record.rule.method)}`}</p>
            <p>{`条件: ${record.rule.operation} ${record.value.toFixed(record.field.precision)}${record.field.unit}`}</p>
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