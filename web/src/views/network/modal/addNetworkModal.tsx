import {Form, Input, Modal, ModalProps, Select} from "antd";
import {FC, useEffect, useState} from "react";
import IpnFormItem from "../../../components/formItems/ipnFormItem";
import WsnFormItem from "../../../components/formItems/wsnFormItem";
import {DEFAULT_WSN_SETTING} from "../../../types/wsn_setting";
import {DEFAULT_IPN_SETTING} from "../../../types/ipn_setting";
import {defaultValidateMessages, Normalizes, Rules} from "../../../constants/validator";
import {CreateNetworkRequest} from "../../../apis/network";
import {NetworkProvisioningMode} from "../../../types/network";

export interface AddNetworkModalProps extends ModalProps{
    onSuccess:() => void;
}

const {Option} = Select;

const AddNetworkModal:FC<AddNetworkModalProps> = (props) => {
    const {visible, onSuccess} = props;
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [provisionMode, setProvisionMode] = useState<number>(NetworkProvisioningMode.Mode1);
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            form.resetFields()
            form.setFieldsValue({
                mode: provisionMode,
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

    return <Modal {...props} width={460} title={"网络添加"} okText={"确定"} onOk={onAdd} cancelText={"取消"} confirmLoading={isLoading}>
        <Form form={form} labelCol={{span: 7}} validateMessages={defaultValidateMessages}>
            <fieldset>
                <legend>基本信息</legend>
                <Form.Item label={"名称"} name={"name"} rules={[Rules.range(4,16)]}>
                    <Input placeholder={"请输入网络名称"}/>
                </Form.Item>
                <Form.Item label={"组网模式"} name={"mode"} rules={[Rules.required]}>
                    <Select placeholder={"请选择组网模式"} onChange={value => {
                        setProvisionMode(Number(value))
                        form.setFieldsValue({wsn: {group_size: 4, communication_period: 2 * 60 * 60 * 1000, communication_offset: 0}})
                    }}>
                        <Option key={1}
                                value={NetworkProvisioningMode.Mode1}>{NetworkProvisioningMode.toString(NetworkProvisioningMode.Mode1)}</Option>
                        <Option key={2}
                                value={NetworkProvisioningMode.Mode2}>{NetworkProvisioningMode.toString(NetworkProvisioningMode.Mode2)}</Option>
                    </Select>
                </Form.Item>
                <WsnFormItem mode={provisionMode}/>
            </fieldset>
            <fieldset>
                <legend>网关信息</legend>
                <Form.Item label={"MAC地址"} name={["gateway", "mac_address"]} normalize={Normalizes.macAddress} rules={[Rules.macAddress]}>
                    <Input placeholder={"请输入网关MAC地址"}/>
                </Form.Item>
                <IpnFormItem ipn={DEFAULT_IPN_SETTING}/>
            </fieldset>
        </Form>
    </Modal>
}

export default AddNetworkModal;