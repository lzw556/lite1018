import {Form, Input, Radio} from "antd";
import {Rules} from "../../constants/validator";
import {FC, useState} from "react";

export const PretighteningSettings = ["initial_pretightening_force", "initial_pretightening_length", "pretightening_k", "elastic_modulus", "elastic_modulus", "sectional_area", "clamped_length"]

export interface PreloadFormItemProps {
    enabled: boolean
}

const PreloadFormItem:FC<PreloadFormItemProps> = ({enabled}) => {
    const [isEnabled, setIsEnabled] = useState<boolean>(enabled)

    const renderPreloadItems = () => {
        return <>
            <Form.Item label={"初始预紧力"} name={["sensors", "initial_pretightening_force"]} initialValue={0} rules={[Rules.number]}>
                <Input placeholder={"请输入初始预紧力值"} suffix={"kN"}/>
            </Form.Item>
            <Form.Item label={"初始预紧长度"} name={["sensors", "initial_pretightening_length"]} initialValue={0}  rules={[Rules.number]}>
                <Input placeholder={"请输入初始预紧长度值"} suffix={"mm"}/>
            </Form.Item>
            <Form.Item label={"预紧力系数"} name={["sensors", "pretightening_k"]} initialValue={1} rules={[Rules.number]}>
                <Input placeholder={"请输入预紧力系数值"}/>
            </Form.Item>
            <Form.Item label={"弹性模量"} name={["sensors", "elastic_modulus"]} initialValue={210} rules={[Rules.number]}>
                <Input placeholder={"请输入弹性模量值"} suffix={"Gpa"}/>
            </Form.Item>
            <Form.Item label={"截面积"} name={["sensors", "sectional_area"]} initialValue={1305.462} rules={[Rules.number]}>
                <Input placeholder={"请输入截面积值"} suffix={"mm²"}/>
            </Form.Item>
            <Form.Item label={"有效受力长度"} name={["sensors", "clamped_length"]} initialValue={215} rules={[Rules.number]}>
                <Input placeholder={"请输入有效受力长度值"} suffix={"mm"}/>
            </Form.Item>
        </>
    }
    return <>
        <Form.Item label={"是否启用预警力"} name={["sensors", "pretightening_is_enabled"]} initialValue={isEnabled}>
            <Radio.Group buttonStyle={"solid"} onChange={e => setIsEnabled(e.target.value)}>
                <Radio.Button value={true}>启用</Radio.Button>
                <Radio.Button value={false}>禁用</Radio.Button>
            </Radio.Group>
        </Form.Item>
        {
            isEnabled && renderPreloadItems()
        }
    </>
}

export default PreloadFormItem