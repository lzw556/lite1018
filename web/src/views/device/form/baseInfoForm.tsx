import {Form, Input} from "antd"
import {CheckMacAddressRequest} from "../../../apis/device";
import AssetSelect from "../../../components/assetSelect";


const BaseInfoForm = (props: any) => {
    const {form} = props


    const onMacValidator = (rule:any, value:any) => {
        return new Promise((resolve, reject) => {
            if (!value) {
                reject("请输入MAC地址")
            }
            if (value.length !== 12) {
                reject("请输入正确的MAC地址")
                return
            }
            CheckMacAddressRequest(value).then(res => {
                if (res.code === 200) {
                    resolve(null)
                }else {
                    reject(res.msg)
                }
            })
        })
    }

    return <Form  form={form} labelCol={{span: 8}}>
        <Form.Item label="设备名称" name="name" rules={[{required: true, message: "请输入设备名称"}]}>
            <Input placeholder={"请输入设备名称"}/>
        </Form.Item>
        <Form.Item label="设备MAC地址" required name="mac" rules={[{validator: onMacValidator}]}>
            <Input placeholder={`请输入设备MAC地址`}/>
        </Form.Item>
        <Form.Item label={"所属资产"} name="asset" rules={[{required: true, message: "请选择资产"}]}>
            <AssetSelect defaultActiveFirstOption={false} placeholder={"请选择设备所属资产"}/>
        </Form.Item>
    </Form>
}

export default BaseInfoForm