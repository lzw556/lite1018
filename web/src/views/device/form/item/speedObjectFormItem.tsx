import {Form, Input} from "antd";
import {Rules} from "../../../../constants/validator";

export const SpeedObjectSettings = ["speed_object"]

const SpeedObjectFormItem = (props: any) => {
    const {value} = props
    return <Form.Item label={"波速"} name="speed_object" initialValue={value} rules={[Rules.number]}>
        <Input placeholder={"请输入波速"}/>
    </Form.Item>
}

export default SpeedObjectFormItem