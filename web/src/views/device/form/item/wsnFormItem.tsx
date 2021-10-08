import {Form, Select} from "antd";
import {COMMUNICATION_PERIOD, COMMUNICATION_TIME_OFFSET} from "../../../../constants";
import {FC} from "react";
import {WsnSetting} from "../../../../types/wsn_setting";

export const WSNSettingKeys = ["communication_period", "communication_time_offset"]


const {Option} = Select

export interface NetworkFormItemProps {
    wsn: WsnSetting
}

const WsnFormItem: FC<NetworkFormItemProps> = ({wsn}) => {
    return <div>
        <Form.Item label={"通讯周期"} name="communication_period" initialValue={wsn.communication_period}>
            <Select placeholder={"请选择网络通讯周期"}>
                {
                    COMMUNICATION_PERIOD.map(item =>
                        <Option key={item.value} value={item.value}>{item.text}</Option>
                    )
                }
            </Select>
        </Form.Item>
        <Form.Item label={"通讯延时"} name="communication_time_offset" initialValue={wsn.communication_time_offset}>
            <Select placeholder={"请选择网络通讯延时"}>
                {
                    COMMUNICATION_TIME_OFFSET.map(item =>
                        <Option value={item.value} key={item.value}>{item.text}</Option>
                    )
                }
            </Select>
        </Form.Item>
    </div>
}

export default WsnFormItem