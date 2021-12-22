import {Device} from "../../../../types/device";
import {FC, useEffect, useState} from "react";
import {GetDeviceSettingRequest} from "../../../../apis/device";
import IPNSetting from "./ipn";
import "../../index.css"
import {DeviceType} from "../../../../types/device_type";
import SensorSetting from "./sensor";
import {Skeleton, Typography} from "antd";
import {EmptyLayout} from "../../../layout";

export interface SettingPageProps {
    device?: Device
}

const SettingPage: FC<SettingPageProps> = ({device}) => {
    const [setting, setSetting] = useState<any>()
    const [isLoading, setIsLoading] = useState<boolean>(false)

    useEffect(() => {
        if (device) {
            setIsLoading(true)
            GetDeviceSettingRequest(device.id).then(data => {
                setIsLoading(false)
                setSetting(data)
            })
        }
    }, [device])

    const renderSetting = () => {
        if (device) {
            if (setting) {
                if (device.typeId === DeviceType.Gateway) {
                    return <IPNSetting device={device} values={setting.ipn}/>
                } else if (device.typeId !== DeviceType.Router) {
                    return <SensorSetting device={device} values={setting.sensors}/>
                }
            }
            return <EmptyLayout description={"暂无配置信息"}/>
        }
        return <div>

        </div>
    }
    return <Skeleton loading={isLoading}>
        {
            device?.binding ?
                <Typography.Text>设备已经绑定了监测点,请到<Typography.Link href={`#/asset-management?locale=assetMonitor/measurementDetail&id=${device.binding}`}>监测点页面</Typography.Link>进行配置修改</Typography.Text> :
                renderSetting()
        }
    </Skeleton>
}

export default SettingPage