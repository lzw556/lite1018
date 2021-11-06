import useSocket from "../socket";
import {Alert, notification, Space} from "antd";
import {useEffect, useState} from "react";
import _ from "lodash";
import {GetFieldName} from "../constants/field";

const AlertNotification = () => {
    const {alertState} = useSocket()
    const [alerts, setAlerts] = useState<any>([])

    useEffect(() => {
        console.log(alertState)
        if (alertState) {
            const newAlerts = _.cloneDeep(alerts)
            newAlerts.push(alertState)
            setAlerts(newAlerts)
        }
    }, [alertState])

    const renderAlertItems = () => {
        return alerts.map((item: any) => renderAlert(item))
    }

    const renderAlert = (alert: any) => {
        if (alert) {
            const content = alert.content.replace(alert.field, GetFieldName(alert.field))
            switch (alert.level) {
                case 1:
                    notification.info({
                        message: alert.title,
                        description: content
                    })
                    break
                case 2:
                    notification.warning({
                        message: alert.title,
                        description: content
                    })
                    break
                case 3:
                    notification.error({
                        message:alert.title,
                        description: content,
                        duration: null
                    })
                    break
                default:
                    notification.success({
                        message: alert.title,
                        description: content,
                    })
                    break
            }
        }
    }

    return <div style={{position: "fixed", top: 0, right: 0, padding: "8px"}}>
        <Space direction={"vertical"}>
            {
                renderAlertItems()
            }
        </Space>
    </div>
}

export default AlertNotification