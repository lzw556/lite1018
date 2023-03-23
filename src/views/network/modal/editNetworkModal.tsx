import { Network } from '../../../types/network';
import { Form, Input, Modal, ModalProps } from 'antd';
import { FC, useEffect, useState } from 'react';
import { Rules } from '../../../constants/validator';
import WsnFormItem from '../../../components/formItems/wsnFormItem';
import { UpdateNetworkRequest } from '../../../apis/network';
import { useProvisionMode } from '../useProvisionMode';
import intl from 'react-intl-universal';

export interface EditNetworkModalProps extends ModalProps {
  network: Network;
  onSuccess: () => void;
}

const EditNetworkModal: FC<EditNetworkModalProps> = (props) => {
  const { visible, network, onSuccess } = props;
  const [form] = Form.useForm();
  const [provisionMode, setProvisionMode, settings] = useProvisionMode(network);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      form.resetFields();
      form.setFieldsValue({ name: network.name });
    }
    setProvisionMode(
      visible && network !== undefined ? (network.mode === 0 ? 1 : network.mode) : undefined
    );
  }, [visible, network, form, setProvisionMode]);

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
    <Modal
      {...props}
      title={intl.get('EDIT_NETWORK')}
      width={420}
      onOk={onSave}
      confirmLoading={isLoading}
    >
      <Form form={form} labelCol={{ span: 7 }}>
        <Form.Item label={intl.get('NAME')} name={'name'} rules={[Rules.required]}>
          <Input
            placeholder={intl.get('PLEASE_ENTER_SOMETHING', {
              something: intl.get('NETWORK_NAME')
            })}
          />
        </Form.Item>
        {provisionMode && <WsnFormItem mode={provisionMode} onModeChange={setProvisionMode} />}
      </Form>
    </Modal>
  );
};

export default EditNetworkModal;
