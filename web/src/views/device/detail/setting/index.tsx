import {Device} from "../../../../types/device";
import {FC, useEffect, useState} from "react";
import {GetDeviceSettingRequest} from "../../../../apis/device";
import IPNSetting from "./ipn";
import "../../index.css"
import {DeviceType} from "../../../../types/device_type";
import SensorSetting from "./sensor";
import {Skeleton} from "antd";

export interface SettingPageProps {
    device?: Device
}

const SettingPage:FC<SettingPageProps> = ({device}) => {
    const [setting, setSetting] = useState<any>()
    const [isLoading, setIsLoading] = useState<boolean>(false)

    useEffect(() => {
        if (device) {
            setIsLoading(true)
            GetDeviceSettingRequest(device.id).then(res => {
                setIsLoading(false)
                if (res.code === 200) {
                    setSetting(res.data)
                }
            })
        }
    }, [device])

    const renderSetting = () => {
        if (device) {
            if (setting) {
                if (device.typeId === DeviceType.Gateway) {
                    return <IPNSetting device={device} values={setting.ipn}/>
                }else if(device.typeId !== DeviceType.Router){
                    return <SensorSetting device={device} values={setting.sensors}/>
                }
            }
        }
        return <div>

        </div>
    }
    return <Skeleton loading={isLoading}>
        {
            renderSetting()
        }
    </Skeleton>
}

export default SettingPage