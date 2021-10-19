import useSocket from "../socket";
import {Alert, Space} from "antd";
import {useCallback, useEffect, useState} from "react";
import _ from "lodash";

const AlertNotification = () => {
    const {alertState} = useSocket()
    const [alerts, setAlerts] = useState<any>([])

    const fetchAlerts = useCallback(() => {
        if (alertState) {
            const newAlerts = _.cloneDeep(alerts)
            newAlerts.push(alertState)
            setAlerts(newAlerts)
        }
    }, [alertState])

    useEffect(() => {
        fetchAlerts()
    }, [fetchAlerts])

    const renderAlertItems = () => {
        return alerts.map((item: any) => renderAlert(item))
    }

    const renderAlert = (alert: any) => {
        if (alert) {
            let type: any = "success"
            switch (alert.level) {
                case 1:
                    type = "info"
                    break
                case 2:
                    type = "warning"
                    break
                case 3:
                    type = "error"
                    break
                default:
                    return <Alert type={"success"} message={alert.title} description={alert.content} showIcon closable={true}/>
            }
            return <Alert type={type} message={alert.title} description={alert.content} showIcon closable={true}/>
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