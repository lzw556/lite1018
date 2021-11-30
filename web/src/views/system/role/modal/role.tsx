import {Form, Input, Modal, ModalProps} from "antd";
import {FC} from "react";

export interface RoleModalProps extends ModalProps{
    form: any;
}

const RoleModal:FC<RoleModalProps> = (props) => {
    const {form} = props

    return <Modal {...props}>
        <Form form={form} labelCol={{span: 6}}>
            <Form.Item name="name" label={"角色名称"} rules={[{required: true, message: "请输入角色名称"}]}>
                <Input placeholder="角色名称"/>
            </Form.Item>
            <Form.Item name={"description"} label={"角色描述"}>
                <Input placeholder={"角色描述"}/>
            </Form.Item>
        </Form>
    </Modal>

}

export default RoleModal;