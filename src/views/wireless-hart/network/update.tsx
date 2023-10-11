import { Form, Input, ModalProps, Select } from 'antd';
import React, { useEffect, useState } from 'react';
import intl from 'react-intl-universal';
import { Network } from '../../../types/network';
import { UpdateNetworkRequest } from '../../../apis/network';
import { FormInputItem } from '../../../components/formInputItem';
import { WIRELESS_HART_POLLING_PERIOD } from '../../../constants';
import { ModalWrapper } from '../../../components/modalWrapper';

export const UpdateNetwork = (
  props: ModalProps & {
    network: Network;
    onSuccess: () => void;
  }
) => {
  const { open, network, onSuccess } = props;
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        name: network.name,
        gateway: {
          ip_address: network.gateway.ipAddress,
          ip_port: network.gateway.ipPort,
          polling_period: network.gateway.pollingPeriod
        }
      });
    }
  }, [open, form, network]);

  const onSave = () => {
    setIsLoading(true);
    form
      .validateFields()
      .then((values) => {
        UpdateNetworkRequest(network.id, {
          ...values,
          gateway: { ...values.gateway, ip_port: Number(values.gateway.ip_port) }
        })
          .then(() => {
            setIsLoading(false);
            onSuccess();
          })
          .catch(() => {
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
      title={intl.get('EDIT_NETWORK')}
      width={420}
      onOk={onSave}
      confirmLoading={isLoading}
    >
      <Form form={form} labelCol={{ span: 7 }}>
        <FormInputItem
          label={intl.get('NAME')}
          name={'name'}
          requiredMessage={intl.get('PLEASE_ENTER_NETWORK_NAME')}
          lengthLimit={{ min: 4, max: 16, label: intl.get('NETWORK').toLowerCase() }}
        >
          <Input placeholder={intl.get('PLEASE_ENTER_NETWORK_NAME')} />
        </FormInputItem>
        <FormInputItem
          label={intl.get('IP_ADDRESS')}
          name={['gateway', 'ip_address']}
          requiredMessage={intl.get('PLEASE_ENTER_SOMETHING', {
            something: intl.get('IP_ADDRESS')
          })}
          lengthLimit={{ min: 4, max: 16, label: intl.get('NETWORK').toLowerCase() }}
        >
          <Input
            placeholder={intl.get('PLEASE_ENTER_SOMETHING', {
              something: intl.get('IP_ADDRESS')
            })}
          />
        </FormInputItem>
        <FormInputItem
          label={intl.get('PORT')}
          name={['gateway', 'ip_port']}
          requiredMessage={intl.get('PLEASE_ENTER_SOMETHING', {
            something: intl.get('PORT')
          })}
          numericRule={{
            isInteger: true,
            min: 1,
            message: intl.get('UNSIGNED_INTEGER_ENTER_PROMPT')
          }}
          placeholder={intl.get('PLEASE_ENTER_SOMETHING', {
            something: intl.get('PORT')
          })}
        />
        <Form.Item label={intl.get('POLLING_PERIOD')} name={['gateway', 'polling_period']}>
          <Select>
            {WIRELESS_HART_POLLING_PERIOD.map(({ value, text }) => (
              <Select.Option value={value} key={value}>
                {intl.get(text)}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </ModalWrapper>
  );
};
