import {Form, Input, Modal, ModalProps, Radio, Select} from "antd";
import {FC, useEffect, useState} from "react";
import {Network} from "../../../types/network";
import DeviceTypeSelect from "../../../components/select/deviceTypeSelect";
import DeviceSelect from "../../../components/select/deviceSelect";
import {AccessDevicesRequest} from "../../../apis/network";
import {Normalizes, Rules} from "../../../constants/validator";
import {DeviceType} from "../../../types/device_type";
import IpnFormItem from "../../../components/formItems/ipnFormItem";
import {DEFAULT_IPN_SETTING} from "../../../types/ipn_setting";
import {GetDevicesRequest} from "../../../apis/device";

export interface AddDeviceModalProps extends ModalProps {
    network: Network
    onSuccess:() => void
}

const AddDeviceModal:FC<AddDeviceModalProps> = (props) => {
    const {visible, network, onSuccess} = props;
    const [isNew, setIsNew] = useState(false);
    const [deviceType, setDeviceType] = useState<DeviceType>();
    const [parents, setParents] = useState<any[]>([])
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            form.resetFields();
            form.setFieldsValue({is_new: false})
        }
    }, [visible])

    const render = () => {
        if (isNew) {
            return <>
                <Form.Item label={"设备名称"} name={"name"} rules={[Rules.required]}>
                    <Input placeholder={"请输入设备名称"}/>
                </Form.Item>
                <Form.Item label={"MAC地址"} name={"mac_address"} normalize={Normalizes.macAddress} rules={[Rules.required]}>
                    <Input placeholder={"请输入设备MAC地址"}/>
                </Form.Item>
                <Form.Item label={"设备类型"} name={"device_type"} rules={[Rules.required]}>
                    <DeviceTypeSelect placeholder={"请选择设备类型"} onChange={value => setDeviceType(value)}/>
                </Form.Item>
                {
                    deviceType === DeviceType.Gateway && <IpnFormItem ipn={DEFAULT_IPN_SETTING} />
                }
            </>
        }
        return <Form.Item label={"设备选择"} name={"devices"} rules={[Rules.required]}>
            <DeviceSelect filters={{network_id: 0, category: 3}} mode={"multiple"} maxTagCount={"responsive"} placeholder={"请选择需要接入的设备"} />
        </Form.Item>
    }

    const onSave = () => {
        form.validateFields().then(values => {
            AccessDevicesRequest(network.id, values).then(_ => {
                onSuccess();
            })
        }).catch(e => {})
    }

    const onParentChange = (open:any) => {
        if (open) {
            GetDevicesRequest({network_id: network.id}).then(setParents)
        }
    }

    return <Modal {...props} title={"设备添加"} width={420} onOk={onSave}>
        <Form form={form} labelCol={{span: 6}}>
            <Form.Item label={"父节点设备"} name={"parent_id"} rules={[Rules.required]}>
                <Select placeholder={"请选择父节点设备"} onDropdownVisibleChange={onParentChange}>
                    {
                        parents.map(node => <Select.Option key={node.id} value={node.id}>{node.name}</Select.Option>)
                    }
                </Select>
            </Form.Item>
            <Form.Item label={"接入方式"} name={"is_new"} rules={[Rules.required]}>
                <Radio.Group buttonStyle={"solid"} onChange={e => setIsNew(e.target.value)}>
                    <Radio.Button value={false}>已有设备</Radio.Button>
                    <Radio.Button value={true}>新设备</Radio.Button>
                </Radio.Group>
            </Form.Item>
            {
                render()
            }
        </Form>
    </Modal>
}

export default AddDeviceModal;