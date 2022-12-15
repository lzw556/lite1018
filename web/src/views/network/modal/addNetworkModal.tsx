import { Form, Input, Modal, ModalProps } from 'antd';
import { FC, useEffect, useState } from 'react';
import IpnFormItem from '../../../components/formItems/ipnFormItem';
import WsnFormItem from '../../../components/formItems/wsnFormItem';
import { DEFAULT_IPN_SETTING } from '../../../types/ipn_setting';
import { defaultValidateMessages, Normalizes, Rules } from '../../../constants/validator';
import { CreateNetworkRequest } from '../../../apis/network';
import { NetworkProvisioningMode } from '../../../types/network';
import { useProvisionMode } from '../useProvisionMode';

export interface AddNetworkModalProps extends ModalProps {
  onSuccess: () => void;
}

const AddNetworkModal: FC<AddNetworkModalProps> = (props) => {
  const { visible, onSuccess } = props;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [provisionMode, setProvisionMode, settings] = useProvisionMode();
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      form.resetFields();
    }
    setProvisionMode(visible ? NetworkProvisioningMode.Mode1 : undefined);
  }, [visible, form, setProvisionMode]);

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
    <Modal
      {...props}
      width={460}
      title={'网络添加'}
      okText={'确定'}
      onOk={onAdd}
      cancelText={'取消'}
      confirmLoading={isLoading}
    >
      <Form form={form} labelCol={{ span: 7 }} validateMessages={defaultValidateMessages}>
        <fieldset>
          <legend>基本信息</legend>
          <Form.Item label={'名称'} name={'name'} rules={[Rules.range(4, 16)]}>
            <Input placeholder={'请输入网络名称'} />
          </Form.Item>
          {provisionMode && <WsnFormItem mode={provisionMode} onModeChange={setProvisionMode} />}
        </fieldset>
        <fieldset>
          <legend>网关信息</legend>
          <Form.Item
            label={'MAC地址'}
            name={['gateway', 'mac_address']}
            normalize={Normalizes.macAddress}
            rules={[Rules.macAddress]}
          >
            <Input placeholder={'请输入网关MAC地址'} />
          </Form.Item>
          <IpnFormItem ipn={DEFAULT_IPN_SETTING} />
        </fieldset>
      </Form>
    </Modal>
  );
};

export default AddNetworkModal;
