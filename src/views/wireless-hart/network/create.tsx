import { Form, Input, Modal, ModalProps, Select } from 'antd';
import React, { useState } from 'react';
import intl from 'react-intl-universal';
import { CreateNetworkRequest } from '../../../apis/network';
import { FormInputItem } from '../../../components/formInputItem';
import { WIRELESS_HART_POLLING_PERIOD } from '../../../constants';

export const CreateNetwork = (
  props: ModalProps & {
    onSuccess: () => void;
  }
) => {
  const { onSuccess } = props;
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const onAdd = () => {
    setIsLoading(true);
    form
      .validateFields()
      .then((values) => {
        CreateNetworkRequest({
          ...values,
          gateway: { ...values.gateway, ip_port: Number(values.gateway.ip_port) }
        })
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
    <Modal
      {...props}
      width={460}
      title={intl.get('CREATE_NETWORK')}
      okText={intl.get('OK')}
      onOk={onAdd}
      cancelText={intl.get('CANCEL')}
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
        <Form.Item
          label={intl.get('POLLING_PERIOD')}
          name={['gateway', 'polling_period']}
          initialValue={30000}
        >
          <Select>
            {WIRELESS_HART_POLLING_PERIOD.map(({ value, text }) => (
              <Select.Option value={value} key={value}>
                {intl.get(text)}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};
