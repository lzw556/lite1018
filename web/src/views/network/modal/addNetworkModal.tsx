import {Divider, Form, Input, Modal, ModalProps} from "antd";
import {FC, useEffect, useState} from "react";
import IpnFormItem from "../../../components/formItems/ipnFormItem";
import WsnFormItem from "../../../components/formItems/wsnFormItem";
import {DEFAULT_WSN_SETTING} from "../../../types/wsn_setting";
import {DEFAULT_IPN_SETTING} from "../../../types/ipn_setting";
import AssetSelect from "../../../components/assetSelect";
import {defaultValidateMessages, Rules} from "../../../constants/validator";
import {CreateNetworkRequest} from "../../../apis/network";

export interface AddNetworkModalProps extends ModalProps{
    onSuccess:() => void;
}

const AddNetworkModal:FC<AddNetworkModalProps> = (props) => {
    const {visible, onSuccess} = props;
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            form.resetFields()
            form.setFieldsValue({
                wsn: DEFAULT_WSN_SETTING
            })
        }
    }, [visible])

    const onAdd = () => {
        setIsLoading(true);
        form.validateFields().then(values => {
            CreateNetworkRequest(values).then(_ => {
                setIsLoading(false);
                onSuccess();
            }).catch(_ => {
                setIsLoading(false);
            })
        }).catch(e => {
            setIsLoading(false);
        })
    }

    return <Modal {...props} width={420} title={"网络添加"} okText={"确定"} onOk={onAdd} cancelText={"取消"} confirmLoading={isLoading}>
        <Form form={form} labelCol={{span: 7}} validateMessages={defaultValidateMessages}>
            <Divider orientation={"left"} plain>基本信息</Divider>
            <Form.Item label={"名称"} name={"name"} rules={[Rules.required]}>
                <Input placeholder={"请输入网络名称"}/>
            </Form.Item>
            <Form.Item label={"所属资产"} name={"asset_id"} rules={[Rules.required]}>
                <AssetSelect placeholder={"请选择网关所属资产"}/>
            </Form.Item>
            <WsnFormItem/>
            <Divider orientation={"left"} plain>网关信息</Divider>
            <Form.Item label={"MAC地址"} name={["gateway", "mac_address"]} rules={[Rules.required]}>
                <Input placeholder={"请输入网关MAC地址"}/>
            </Form.Item>
            <IpnFormItem ipn={DEFAULT_IPN_SETTING}/>
        </Form>
    </Modal>
}

export default AddNetworkModal;