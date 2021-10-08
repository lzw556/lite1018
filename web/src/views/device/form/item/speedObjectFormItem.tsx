import {Form, Input} from "antd";

export const SpeedObjectSettings = ["speed_object"]

const SpeedObjectFormItem = (props:any) => {
    const {value} = props
    return <Form.Item label={"波速"} name="speed_object" initialValue={value} rules={[{required: true, message: "请输入波速"}]}>
        <Input type={"number"} placeholder={"请输入波速"}/>
    </Form.Item>
}

export default SpeedObjectFormItem