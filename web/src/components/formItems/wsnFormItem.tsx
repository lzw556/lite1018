import {Form} from "antd";
import {FC} from "react";
import CommunicationPeriodSelect from "../../components/communicationPeriodSelect";
import CommunicationTimeOffsetSelect from "../../components/communicationTimeOffsetSelect";
import GroupSizeSelect from "../../components/groupSizeSelect";
import GroupIntervalSelect from "../../components/groupIntervalSelect";
import {Rules} from "../../constants/validator";

export const WSNSettingKeys = ["communication_period", "communication_time_offset", "group_size", "group_interval"]


export interface NetworkFormItemProps {
}

const WsnFormItem: FC<NetworkFormItemProps> = () => {
    return <div>
        <Form.Item label={"通讯周期"} name={["wsn", "communication_period"]} rules={[Rules.required]}>
            <CommunicationPeriodSelect placeholder={"请选择网络通讯周期"}/>
        </Form.Item>
        <Form.Item label={"通讯延时"} name={["wsn", "communication_time_offset"]} rules={[Rules.required]}>
            <CommunicationTimeOffsetSelect placeholder={"请选择网络通讯延时"}/>
        </Form.Item>
        <Form.Item label={"每组设备数"} name={["wsn", "group_size"]} rules={[Rules.required]}>
            <GroupSizeSelect placeholder={"请选择网络每组设备数"} />
        </Form.Item>
        <Form.Item label={"每组通信间隔"} name={["wsn", "group_interval"]} rules={[Rules.required]}>
            <GroupIntervalSelect placeholder={"请选择网络每组通信间隔"}/>
        </Form.Item>
    </div>
}

export default WsnFormItem