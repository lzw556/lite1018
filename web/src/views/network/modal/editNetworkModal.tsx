import {Network} from "../../../types/network";
import {Form, Input, Modal, ModalProps, Radio} from "antd";
import {FC, useEffect, useState} from "react";
import {Rules} from "../../../constants/validator";
import WsnFormItem from "../../../components/formItems/wsnFormItem";
import {UpdateNetworkRequest} from "../../../apis/network";

export interface EditNetworkModalProps extends ModalProps{
  network: Network;
  onSuccess: () => void;
}

const EditNetworkModal:FC<EditNetworkModalProps> = (props) => {
    const {visible, network, onSuccess} = props
    const [form] = Form.useForm();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            form.setFieldsValue({
                name: network.name,
                mode: network.mode,
                wsn: {
                    communication_period: network.communicationPeriod,
                    communication_offset: network.communicationOffset,
                    group_size: network.groupSize,
                    group_interval: network.groupInterval,
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
            {/*<Form.Item label={"模式"} name={"mode"}>*/}
            {/*    <Radio.Group buttonStyle={"solid"}>*/}
            {/*        <Radio.Button key={1} value={1}>云端模式</Radio.Button>*/}
            {/*        <Radio.Button key={2} value={2}>本地模式</Radio.Button>*/}
            {/*    </Radio.Group>*/}
            {/*</Form.Item>*/}
            <WsnFormItem/>
        </Form>
    </Modal>
}

export default EditNetworkModal;