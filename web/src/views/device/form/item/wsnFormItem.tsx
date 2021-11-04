import {Form} from "antd";
import {FC} from "react";
import {WsnSetting} from "../../../../types/wsn_setting";
import CommunicationPeriodSelect from "../../../../components/communicationPeriodSelect";
import CommunicationTimeOffsetSelect from "../../../../components/communicationTimeOffsetSelect";
import GroupSizeSelect from "../../../../components/groupSizeSelect";
import GroupIntervalSelect from "../../../../components/groupIntervalSelect";

export const WSNSettingKeys = ["communication_period", "communication_time_offset", "group_size", "group_interval"]


export interface NetworkFormItemProps {
    wsn: WsnSetting
}

const WsnFormItem: FC<NetworkFormItemProps> = ({wsn}) => {
    return <div>
        <Form.Item label={"通讯周期"} name="communication_period" initialValue={wsn.communication_period}>
            <CommunicationPeriodSelect placeholder={"请选择网络通讯周期"}/>
        </Form.Item>
        <Form.Item label={"通讯延时"} name="communication_time_offset" initialValue={wsn.communication_time_offset}>
            <CommunicationTimeOffsetSelect placeholder={"请选择网络通讯延时"}/>
        </Form.Item>
        <Form.Item label={"每组设备数"} name="group_size" initialValue={wsn.group_size}>
            <GroupSizeSelect placeholder={"请选择网络每组设备数"} />
        </Form.Item>
        <Form.Item label={"每组通信间隔"} name="group_interval" initialValue={wsn.group_interval}>
            <GroupIntervalSelect placeholder={"请选择网络每组通信间隔"}/>
        </Form.Item>
    </div>
}

export default WsnFormItem