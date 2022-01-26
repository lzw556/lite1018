import {Form, Input, Modal, ModalProps} from "antd";
import {FC, useEffect, useState} from "react";
import {defaultValidateMessages, Rules} from "../../../constants/validator";
import {Network} from "../../../types/network";
import {AddDeviceRequest} from "../../../apis/device";
import {DeviceType} from "../../../types/device_type";

export interface AddDeviceModalProps extends ModalProps {
    network: Network
    onSuccess: () => void;
}

const AddDeviceModal: FC<AddDeviceModalProps> = (props) => {
    const {visible, network, onSuccess} = props;
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [form] = Form.useForm();

    useEffect(() => {
        form.resetFields();
    }, [visible])

    const onAdd = () => {
        setIsLoading(true);
        form.validateFields().then(values => {
            const params = {
                name: values.name,
                mac_address: values.mac_address,
                type_id: DeviceType.Router,
                network_id: network.id
            }
            AddDeviceRequest(params).then(_ => {
                setIsLoading(false);
                onSuccess();
            }).catch(_ => {
                setIsLoading(false);
            })
        })
    }

    return <Modal {...props} width={420} title={"中继器添加"} okText={"确定"} onOk={onAdd} cancelText={"取消"}
                  confirmLoading={isLoading}>
        <Form form={form} labelCol={{span: 7}} validateMessages={defaultValidateMessages}>
            <Form.Item label={"名称"} name={"name"} rules={[Rules.required]}>
                <Input placeholder={"请输入中继器名称"}/>
            </Form.Item>
            <Form.Item label={"MAC地址"} name={"mac_address"} rules={[Rules.required]}>
                <Input placeholder={"请输入中继器MAC地址"}/>
            </Form.Item>
        </Form>
    </Modal>
}

export default AddDeviceModal;