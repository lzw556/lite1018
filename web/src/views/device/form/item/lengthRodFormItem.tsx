import {Form, Input} from "antd";
import {Rules} from "../../../../constants/validator";

export const LengthRodSettings = ["length_rod"]

const LengthRodFormItem = (props:any) => {
    const {expand} = props

    if (expand) {
        return <Form.Item label={"杆长"}  name={"length_rod"} rules={[Rules.number]}>
            <Input placeholder={"请输入杆长值"} suffix={"mm"}/>
        </Form.Item>
    }
    return null
}

export default LengthRodFormItem