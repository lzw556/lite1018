import {Form, Input} from "antd";
import {Rules} from "../../constants/validator";

export const FlangeSettings = ["number_of_bolts", "offset_of_angel"]

const FlangeFormItem = () => {
    return <>
        <Form.Item label={"螺栓数量"} name={["settings", "number_of_bolts"]} initialValue={1} rules={[Rules.number]}>
            <Input placeholder={"请输入法兰螺栓数量"} suffix={"个"}/>
        </Form.Item>
        <Form.Item label={"角度偏移"} name={["settings", "offset_of_angel"]} initialValue={0}  rules={[Rules.number]}>
            <Input placeholder={"请输入角度偏移"} suffix={""}/>
        </Form.Item>
    </>
}

export default FlangeFormItem