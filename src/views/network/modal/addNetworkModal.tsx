import { Form, Input, ModalProps, Typography } from 'antd';
import { FC, useEffect, useState } from 'react';
import IpnFormItem from '../../../components/formItems/ipnFormItem';
import WsnFormItem from '../../../components/formItems/wsnFormItem';
import { DEFAULT_IPN_SETTING } from '../../../types/ipn_setting';
import { Normalizes } from '../../../constants/validator';
import { CreateNetworkRequest } from '../../../apis/network';
import { NetworkProvisioningMode } from '../../../types/network';
import { useProvisionMode } from '../useProvisionMode';
import intl from 'react-intl-universal';
import { FormInputItem } from '../../../components/formInputItem';
import { useLocaleFormLayout } from '../../../hooks/useLocaleFormLayout';
import { ModalWrapper } from '../../../components/modalWrapper';

export interface AddNetworkModalProps extends ModalProps {
  onSuccess: () => void;
}

const AddNetworkModal: FC<AddNetworkModalProps> = (props) => {
  const { open, onSuccess } = props;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [provisionMode, setProvisionMode, settings] = useProvisionMode();
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
    setProvisionMode(open ? NetworkProvisioningMode.Mode2 : undefined);
  }, [open, form, setProvisionMode]);

  useEffect(() => {
    if (settings) {
      form.setFieldsValue(settings);
    }
  }, [form, settings]);

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
          {provisionMode && <WsnFormItem mode={provisionMode} onModeChange={setProvisionMode} />}
        </fieldset>
        <fieldset>
          <legend>{intl.get('GATEWAY_INFORMATION')}</legend>
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

export default AddNetworkModal;
