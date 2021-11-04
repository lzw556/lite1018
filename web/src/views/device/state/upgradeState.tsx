import {Progress, Space, Spin} from "antd";
import {LoadingOutlined} from "@ant-design/icons";
import Text from "antd/es/typography/Text";
import {FC} from "react";
import {DeviceUpgradeStatus} from "../../../types/device_upgrade_status";

export interface UpgradeStateProps {
    status: number
    progress: number
}

const DeviceUpgradeState:FC<UpgradeStateProps> = ({status, progress}) => {

    const render = () => {
        switch (status) {
            case DeviceUpgradeStatus.Pending:
                return <>
                    <Spin size={"small"} indicator={<LoadingOutlined/>} spinning={true}/>
                    <Text strong style={{fontSize: "9pt", color: "#8a8e99"}}>连接中</Text>
                </>
            case DeviceUpgradeStatus.Loading:
                return <>
                    <Progress type="circle" showInfo={false} percent={progress} strokeWidth={12}
                              width={16}/>
                    <Text strong style={{
                        fontSize: "9pt",
                        color: "#8a8e99"
                    }}>{`固件下载中${progress.toFixed(0)}%`}</Text>
                </>
            case DeviceUpgradeStatus.Upgrading:
                return <>
                    <Progress type="circle" showInfo={false} percent={progress} strokeWidth={12}
                              width={16}/>
                    <Text style={{
                        fontSize: "9pt",
                        color: "#8a8e99"
                    }}>{`升级中${progress.toFixed(0)}%`}</Text>
                </>
            case DeviceUpgradeStatus.Cancelled:
                return <>
                    <Progress type="circle" showInfo={false} percent={progress} strokeWidth={12}
                              width={16}/>
                    <Text style={{
                        fontSize: "9pt",
                    }} type={"warning"}>升级已取消</Text>
                </>
            case DeviceUpgradeStatus.Error:
                return <>
                    <Progress type="circle" showInfo={false} percent={progress} strokeWidth={12}
                              width={16} status={"exception"}/>
                    <Text style={{fontSize: "9pt"}} type={"danger"}>升级失败</Text>
                </>
            case DeviceUpgradeStatus.Success:
                return <>
                    <Progress type="circle" percent={progress} strokeWidth={12}
                              width={16}/>
                    <Text style={{fontSize: "9pt"}} type={"success"}>升级成功</Text>
                </>
        }
        return <></>
    }

    return <Space>
        {
            render()
        }
    </Space>
}

export default DeviceUpgradeState