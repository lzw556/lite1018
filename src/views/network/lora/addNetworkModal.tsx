import { Form, Input, ModalProps, Typography } from 'antd';
import { FC, useEffect, useState } from 'react';
import IpnFormItem from '../../../components/formItems/ipnFormItem';
import { DEFAULT_IPN_SETTING } from '../../../types/ipn_setting';
import { Normalizes } from '../../../constants/validator';
import { CreateNetworkRequest } from '../../../apis/network';
import intl from 'react-intl-universal';
import { FormInputItem } from '../../../components/formInputItem';
import { useLocaleFormLayout } from '../../../hooks/useLocaleFormLayout';
import { ModalWrapper } from '../../../components/modalWrapper';
import LoRaWSNFormItem from '../../../components/formItems/loRaWSNFormItem';
import { DEFAULT_WSN_SETTING } from '../../../types/wsn_setting';
import { DeviceType } from '../../../types/device_type';

export interface AddNetworkModalProps extends ModalProps {
  onSuccess: () => void;
}

const AddLoraNetworkModal: FC<AddNetworkModalProps> = (props) => {
  const { open, onSuccess } = props;
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({ wsn: DEFAULT_WSN_SETTING });
    }
  }, [open, form]);

  const onAdd = () => {
    setIsLoading(true);
    form
      .validateFields()
      .then((values) => {
        CreateNetworkRequest(values)
          .then((_) => {
            setIsLoading(false);
            onSuccess();
          })
          .catch((_) => {
            setIsLoading(false);
          });
      })
      .catch((e) => {
        setIsLoading(false);
      });
  };

  return (
    <ModalWrapper
      {...props}
      width={460}
      title={intl.get('CREATE_NETWORK')}
      onOk={onAdd}
      confirmLoading={isLoading}
    >
      <Form form={form} {...useLocaleFormLayout(9)} labelWrap={true}>
        <fieldset>
          <legend>{intl.get('BASIC_INFORMATION')}</legend>

          <FormInputItem
            label={intl.get('NAME')}
            name={'name'}
            requiredMessage={intl.get('PLEASE_ENTER_NETWORK_NAME')}
            lengthLimit={{ min: 4, max: 16, label: intl.get('NETWORK').toLowerCase() }}
          >
            <Input placeholder={intl.get('PLEASE_ENTER_NETWORK_NAME')} />
          </FormInputItem>
          <LoRaWSNFormItem />
        </fieldset>
        <fieldset>
          <legend>{intl.get('GATEWAY_INFORMATION')}</legend>
          <Form.Item hidden={true} name={['gateway', 'type']} initialValue={DeviceType.GatewayLora}>
            <Input />
          </Form.Item>
          <Form.Item
            label={
              <Typography.Text ellipsis={true} title={intl.get('MAC_ADDRESS')}>
                {intl.get('MAC_ADDRESS')}
              </Typography.Text>
            }
            name={['gateway', 'mac_address']}
            normalize={Normalizes.macAddress}
            rules={[
              {
                required: true,
                message: intl.get('PLEASE_ENTER_SOMETHING', { something: intl.get('MAC_ADDRESS') })
              },
              {
                pattern: /^([0-9a-fA-F]{2})(([0-9a-fA-F]{2}){5})$/,
                message: intl.get('MAC_ADDRESS_IS_INVALID')
              }
            ]}
          >
            <Input placeholder={intl.get('PLEASE_ENTER_GATEWAY_MAC')} />
          </Form.Item>
          <IpnFormItem ipn={DEFAULT_IPN_SETTING} />
        </fieldset>
      </Form>
    </ModalWrapper>
  );
};

export default AddLoraNetworkModal;
