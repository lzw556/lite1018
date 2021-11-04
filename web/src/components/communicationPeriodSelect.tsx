import {Select, SelectProps} from "antd";
import {FC} from "react";
import {COMMUNICATION_PERIOD} from "../constants";
import {CaretDownOutlined} from "@ant-design/icons";

const {Option} = Select

export interface CommunicationPeriodSelectProps extends SelectProps<any> {

}

const CommunicationPeriodSelect: FC<CommunicationPeriodSelectProps> = (props) => {
    return <Select {...props} suffixIcon={<CaretDownOutlined />}>
        {
            COMMUNICATION_PERIOD.map(item =>
                <Option key={item.value} value={item.value}>{item.text}</Option>
            )
        }
    </Select>
}

export default CommunicationPeriodSelect