import {Form, Input, Modal} from 'antd';
import {useEffect, useState} from 'react';
import {UpdateDeviceRequest} from '../../../apis/device';
import NetworkSelect from '../../../components/select/networkSelect';
import {defaultValidateMessages, Normalizes, Rules} from '../../../constants/validator';
import {DeviceType} from '../../../types/device_type';
import DeviceSelect from '../../../components/select/deviceSelect';

const EditBaseInfoModel = (props: any) => {
    const {visible, device, onCancel, onSuccess} = props;
    const [form] = Form.useForm();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [network, setNetwork] = useState<number>();

    const onSave = () => {
        form.validateFields().then((values) => {
            setIsLoading(true);
            UpdateDeviceRequest(device.id, values).then((_) => {
                setIsLoading(false);
                onSuccess();
            });
        });
    };

    useEffect(() => {
        if (device && visible) {
            if (device.network) setNetwork(device.network.id)
            form.setFieldsValue({
                name: device.name,
                mac_address: device.macAddress,
                network: device.network && device.network.id,
                parent: device.parent
            });
        }
    }, [device, visible]);

    return (
        <Modal
            width={420}
            visible={visible}
            title={'设备信息'}
            okText={'更新'}
            onOk={onSave}
            cancelText={'取消'}
            onCancel={onCancel}
            confirmLoading={isLoading}
        >
            <Form form={form} labelCol={{span: 8}} validateMessages={defaultValidateMessages}>
                <Form.Item label={'设备名称'} name='name' rules={[Rules.range(4, 20)]}>
                    <Input placeholder={'请输入设备名称'}/>
                </Form.Item>
                <Form.Item
                    label={'设备MAC地址'}
                    name='mac_address'
                    rules={[Rules.macAddress]}
                    normalize={Normalizes.macAddress}
                    required
                >
                    <Input placeholder={'请输入设备MAC地址'}/>
                </Form.Item>
                <Form.Item label={'所属网络'} name={'network'} rules={[Rules.required]} hidden={device && (device.parent === '' || device.parent === device.macAddress)}>
                    <NetworkSelect
                        placeholder={'请选择设备所属网络'}
                        onChange={(value) => {
                            setNetwork(value);
                            form.resetFields(['parent']);
                        }}
                    />
                </Form.Item>
                {
                    device && (device.parent !== '' && device.parent !== device.macAddress) && <Form.Item label={'设备父节点'} name={'parent'}>
                        <DeviceSelect
                            filters={{network_id: network }}
                            placeholder={'请选择设备所属父节点'}
                            dispalyField='macAddress'
                        />
                    </Form.Item>
                }

            </Form>
        </Modal>
    );
};

export default EditBaseInfoModel;
