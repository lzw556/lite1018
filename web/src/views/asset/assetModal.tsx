import {FC} from "react";
import {Form, Input, Modal, ModalProps} from "antd";

export interface AssetModalProps extends ModalProps {
    form: any
}

const AssetModal: FC<AssetModalProps> = (props) => {
    const {form} = props

    return <Modal {...props}>
        <Form form={form}>
            <Form.Item name="name" label={"资产名称"} rules={[{required: true, message: "请输入资产名称"}]}>
                <Input placeholder="资产名称"/>
            </Form.Item>
        </Form>
    </Modal>
}

export default AssetModal