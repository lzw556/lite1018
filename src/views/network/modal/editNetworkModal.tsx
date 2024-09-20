import { Network } from '../../../types/network';
import { Form, Input, ModalProps } from 'antd';
import { FC, useEffect, useState } from 'react';
import WsnFormItem from '../../../components/formItems/wsnFormItem';
import { UpdateNetworkRequest } from '../../../apis/network';
import { useProvisionMode } from '../useProvisionMode';
import intl from 'react-intl-universal';
import { FormInputItem } from '../../../components/formInputItem';
import { useLocaleFormLayout } from '../../../hooks/useLocaleFormLayout';
import { ModalWrapper } from '../../../components/modalWrapper';

export interface EditNetworkModalProps extends ModalProps {
  network: Network;
  onSuccess: () => void;
}

const EditNetworkModal: FC<EditNetworkModalProps> = (props) => {
  const { open, network, onSuccess } = props;
  const [form] = Form.useForm();
  const [provisionMode, setProvisionMode, settings] = useProvisionMode(network);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({ name: network.name });
    }
    setProvisionMode(
      open && network !== undefined ? (network.mode === 0 ? 1 : network.mode) : undefined
    );
  }, [open, network, form, setProvisionMode]);

  useEffect(() => {
    if (settings) {
      form.setFieldsValue(settings);
    }
  }, [form, settings]);

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
      <Form form={form} {...useLocaleFormLayout(18, 'vertical')} labelWrap={true}>
        <FormInputItem
          label={intl.get('NAME')}
          name='name'
          requiredMessage={intl.get('PLEASE_ENTER_NAME')}
          lengthLimit={{ min: 4, max: 16, label: intl.get('NAME').toLowerCase() }}
        >
          <Input placeholder={intl.get('PLEASE_ENTER_NAME')} />
        </FormInputItem>
        {provisionMode && <WsnFormItem mode={provisionMode} onModeChange={setProvisionMode} />}
      </Form>
    </ModalWrapper>
  );
};

export default EditNetworkModal;
