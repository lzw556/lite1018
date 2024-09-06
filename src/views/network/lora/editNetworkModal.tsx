import { Network } from '../../../types/network';
import { Form, Input, ModalProps } from 'antd';
import { FC, useEffect, useState } from 'react';
import { UpdateNetworkRequest } from '../../../apis/network';
import intl from 'react-intl-universal';
import { FormInputItem } from '../../../components/formInputItem';
import { useLocaleFormLayout } from '../../../hooks/useLocaleFormLayout';
import { ModalWrapper } from '../../../components/modalWrapper';

export interface EditNetworkModalProps extends ModalProps {
  network: Network;
  onSuccess: () => void;
}

const EditLoraNetworkModal: FC<EditNetworkModalProps> = (props) => {
  const { open, network, onSuccess } = props;
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({
        name: network.name,
        wsn: {
          communication_period: network.communicationPeriod,
          communication_period_2: network.communicationPeriod2,
          communication_offset: network.communicationOffset
        }
      });
    }
  }, [open, network, form]);

  const onSave = () => {
    setIsLoading(true);
    form
      .validateFields()
      .then((values) => {
        UpdateNetworkRequest(network.id, values)
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
      <Form form={form} {...useLocaleFormLayout(9)} labelWrap={true}>
        <FormInputItem
          label={intl.get('NAME')}
          name='name'
          requiredMessage={intl.get('PLEASE_ENTER_NAME')}
          lengthLimit={{ min: 4, max: 16, label: intl.get('NAME').toLowerCase() }}
        >
          <Input placeholder={intl.get('PLEASE_ENTER_NAME')} />
        </FormInputItem>
      </Form>
    </ModalWrapper>
  );
};

export default EditLoraNetworkModal;
