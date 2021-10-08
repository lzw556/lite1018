import {Form, Input} from "antd";

export const LengthRodSettings = ["length_rod"]

const LengthRodFormItem = (props:any) => {
    const {expand} = props

    if (expand) {
        return <Form.Item label={"杆长"} name={"length_rod"} rules={[{required: true, message:"请输入杆长值"}]}>
            <Input type={"number"} placeholder={"请输入杆长值"} suffix={"mm"}/>
        </Form.Item>
    }
    return null
}

export default LengthRodFormItem