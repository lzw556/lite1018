import {Form, Input} from "antd";
import {numberRule} from "../../../../constants/validateMessage";

export const SpeedObjectSettings = ["speed_object"]



const SpeedObjectFormItem = (props: any) => {
    const {value} = props
    return <Form.Item label={"波速"} name="speed_object" initialValue={value} rules={[numberRule]}>
        <Input placeholder={"请输入波速"}/>
    </Form.Item>
}

export default SpeedObjectFormItem