import useSocket from "../socket";
import {notification, Space} from "antd";
import {useEffect, useState} from "react";
import {GetFieldName} from "../constants/field";

const AlertNotification = () => {
    const {alertState} = useSocket()
    const [alert, setAlert] = useState<any>()

    useEffect(() => {
        console.log(alertState)
        if (alertState) {
            setAlert(alertState)
        }
    }, [alertState])


    const renderAlert = () => {
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
        return null
    }

    return <div style={{position: "fixed", top: 0, right: 0, padding: "8px"}}>
        <Space direction={"vertical"}>
            {
                renderAlert()
            }
        </Space>
    </div>
}

export default AlertNotification