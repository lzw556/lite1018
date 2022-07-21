import {Network, NetworkProvisioningMode} from "../../../types/network";
import {Form, Input, Modal, ModalProps, Radio, Select} from "antd";
import {FC, useEffect, useState} from "react";
import {Rules} from "../../../constants/validator";
import WsnFormItem from "../../../components/formItems/wsnFormItem";
import {UpdateNetworkRequest} from "../../../apis/network";

export interface EditNetworkModalProps extends ModalProps{
  network: Network;
  onSuccess: () => void;
}

const {Option} = Select;

const EditNetworkModal:FC<EditNetworkModalProps> = (props) => {
    const {visible, network, onSuccess} = props
    const [form] = Form.useForm();
    const [provisionMode, setProvisionMode] = useState<number>(NetworkProvisioningMode.Mode1);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            setProvisionMode(network.mode)
            form.setFieldsValue({
                name: network.name,
                mode: network.mode === 0 ? 1 : network.mode,
                wsn: {
                    communication_period: network.communicationPeriod,
                    communication_period_2: network.communicationPeriod2,
                    communication_offset: network.communicationOffset,
                    group_size: network.groupSize,
                }
            })
        }
    }, [visible])

    const onSave = () => {
        setIsLoading(true);
        form.validateFields().then(values => {
            UpdateNetworkRequest(network.id, values).then(() => {
                setIsLoading(false)
                onSuccess()
            }).catch(() => {
                setIsLoading(false)
            })
        }).catch(e => {
            setIsLoading(false);
        })
    }

    return <Modal {...props} title={"网络编辑"} width={420} onOk={onSave} confirmLoading={isLoading}>
        <Form form={form} labelCol={{span: 7}}>
            <Form.Item label={"名称"} name={"name"} rules={[Rules.required]}>
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
        </Form>
    </Modal>
}

export default EditNetworkModal;