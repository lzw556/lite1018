import {Form, FormItemProps, Select} from "antd";
import {FC} from "react";
import {SAMPLE_PERIOD_1} from "../../constants";

export interface SamplePeriodFormItemProps extends FormItemProps{
}

const {Option} = Select;

const SamplePeriodFormItem: FC<SamplePeriodFormItemProps> = (props) => {
    return <Form.Item {...props} label={"采集周期"} name={["sensors", "schedule0_sample_period"]} rules={[{required: true, message: "请选择采集周期"}]}>
        <Select placeholder={"请选择采集周期"}>
            {
                SAMPLE_PERIOD_1.map(item =>
                    <Option key={item.value} value={item.value}>{item.text}</Option>
                )
            }
        </Select>
    </Form.Item>
}

export default SamplePeriodFormItem;