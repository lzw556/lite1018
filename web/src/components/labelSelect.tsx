import {Select, SelectProps} from "antd";
import {FC} from "react";
import Label from "./label";

export interface LabelSelectProps extends SelectProps<any> {
    label?: string
}

const LabelSelect: FC<LabelSelectProps> = (props) => {
    const {label} = props
    return <Label name={label}>
        <Select {...props} bordered={false} >

        </Select>
    </Label>
}

export default LabelSelect