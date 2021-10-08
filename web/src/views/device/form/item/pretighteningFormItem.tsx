import {Form, Input} from "antd";

export const PretighteningSettings = ["initial_pretightening_force", "initial_pretightening_length", "pretightening_k", "elastic_modulus", "elastic_modulus", "sectional_area", "clamped_length"]

const PretighteningFormItem = (props: any) => {
    const {expand} = props

    if (expand) {
        return <div>
            <Form.Item label={"初始预紧力"} name="initial_pretightening_force" rules={[{required: true, message: "请输入初始预紧力值"}]}>
                <Input type={"number"} placeholder={"请输入初始预紧力值"} suffix={"kN"}/>
            </Form.Item>
            <Form.Item label={"初始预紧长度"} name="initial_pretightening_length" rules={[{required: true, message: "请输入初始预紧长度值"}]}>
                <Input type={"number"} placeholder={"请输入初始预紧长度值"} suffix={"mm"}/>
            </Form.Item>
            <Form.Item label={"预紧力系数"} name="pretightening_k" rules={[{required: true, message: "请输入预紧力系数值"}]}>
                <Input type={"number"} placeholder={"请输入预紧力系数值"}/>
            </Form.Item>
            <Form.Item label={"弹性模量"} name="elastic_modulus" rules={[{required: true, message: "请输入弹性模量值"}]}>
                <Input type={"number"} placeholder={"请输入弹性模量值"} suffix={"Gpa"}/>
            </Form.Item>
            <Form.Item label={"截面积"} name="sectional_area" rules={[{required: true, message: "请输入截面积值"}]}>
                <Input type={"number"} placeholder={"请输入截面积值"} suffix={"mm²"}/>
            </Form.Item>
            <Form.Item label={"有效受力长度"} name="clamped_length" rules={[{required: true, message: "请输入有效受力长度值"}]}>
                <Input type={"number"} placeholder={"请输入有效受力长度值"} suffix={"mm"}/>
            </Form.Item>
        </div>
    }
    return null
}

export default PretighteningFormItem