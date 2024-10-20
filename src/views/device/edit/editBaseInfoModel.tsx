import { Form, Input } from 'antd';
import { useEffect, useState } from 'react';
import { UpdateDeviceRequest } from '../../../apis/device';
import NetworkSelect from '../../../components/select/networkSelect';
import { Normalizes, Rules } from '../../../constants/validator';
import DeviceSelect from '../../../components/select/deviceSelect';
import intl from 'react-intl-universal';
import { FormInputItem } from '../../../components/formInputItem';
import { ModalWrapper } from '../../../components/modalWrapper';

const EditBaseInfoModel = (props: any) => {
  const { open, device, onCancel, onSuccess } = props;
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
    if (device && form) {
      if (device.network) setNetwork(device.network.id);
      form.setFieldsValue({
        name: device.name,
        mac_address: device.macAddress,
        network: device.network && device.network.id,
        parent: device.parent
      });
    }
  }, [device, form]);

  return (
    <ModalWrapper
      width={420}
      open={open}
      title={intl.get('DEVICE_INFO')}
      okText={intl.get('UPDATE')}
      onOk={onSave}
      onCancel={onCancel}
      confirmLoading={isLoading}
    >
      <Form form={form} labelCol={{ span: 8 }}>
        <FormInputItem
          label={intl.get('DEVICE_NAME')}
          name='name'
          requiredMessage={intl.get('PLEASE_ENTER_DEVICE_NAME')}
          lengthLimit={{ min: 4, max: 20, label: intl.get('DEVICE_NAME') }}
        >
          <Input placeholder={intl.get('PLEASE_ENTER_DEVICE_NAME')} />
        </FormInputItem>
        <Form.Item
          label={intl.get('MAC_ADDRESS')}
          name='mac_address'
          rules={[
            {
              required: true,
              message: intl.get('PLEASE_ENTER_MAC_ADDRESS')
            },
            {
              pattern: /^([0-9a-fA-F]{2})(([0-9a-fA-F]{2}){5})$/,
              message: intl.get('MAC_ADDRESS_IS_INVALID')
            }
          ]}
          normalize={Normalizes.macAddress}
          required
        >
          <Input placeholder={intl.get('PLEASE_ENTER_MAC_ADDRESS')} />
        </Form.Item>

        {device && device.parent !== '' && device.parent !== device.macAddress && (
          <Form.Item
            label={intl.get('NETWORK_BELONG_TO')}
            name={'network'}
            rules={[Rules.required]}
          >
            <NetworkSelect
              placeholder={intl.get('PLEASE_SELECT_NETWORK_BELONG_TO')}
              onChange={(value) => {
                setNetwork(value);
                form.resetFields(['parent']);
              }}
            />
          </Form.Item>
        )}
        {device && device.parent !== '' && device.parent !== device.macAddress && (
          <Form.Item label={intl.get('PARENT')} name={'parent'}>
            <DeviceSelect
              filters={{ network_id: network }}
              placeholder={intl.get('PLEASE_SELECT_PARENT')}
              dispalyField='macAddress'
            />
          </Form.Item>
        )}
      </Form>
    </ModalWrapper>
  );
};

export default EditBaseInfoModel;
