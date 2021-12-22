import {Select, SelectProps} from "antd";
import {FC} from "react";
import {SAMPLE_PERIOD_1} from "../../constants";

export interface SamplePeriodSelectProps extends SelectProps<any>{

}

const {Option} = Select;

const SamplePeriodSelect:FC<SamplePeriodSelectProps> = (props) => {
    return <Select {...props}>
        {
            SAMPLE_PERIOD_1.map(period => (
                <Option key={period.value} value={period.value}>{period.text}</Option>))
        }
    </Select>
}

export default SamplePeriodSelect