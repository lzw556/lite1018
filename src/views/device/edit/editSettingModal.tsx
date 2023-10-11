import { Form, Modal, ModalProps } from 'antd';
import { Device } from '../../../types/device';
import { GetDeviceSettingRequest, UpdateDeviceSettingRequest } from '../../../apis/device';
import { useEffect, useState } from 'react';
import { DeviceSettingContent } from '../DeviceSettingContent';
import { processArrayValuesInSensorSetting } from '../../../components/formItems/deviceSettingFormItem';
import intl from 'react-intl-universal';

export interface EditSettingProps extends ModalProps {
  device: Device;
  open: boolean;
  onSuccess: () => void;
}

const EditSettingModal = (props: EditSettingProps) => {
  const { device, open, onCancel, onSuccess } = props;
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [settings, setSettings] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      GetDeviceSettingRequest(device.id).then(setSettings);
    }
  }, [open, device.id]);

  const onSave = () => {
    form.validateFields().then((values) => {
      setIsLoading(true);
      UpdateDeviceSettingRequest(device.id, {
        ...values,
        sensors: processArrayValuesInSensorSetting(values.sensors)
      }).then((_) => {
        setIsLoading(false);
        onSuccess();
      });
    });
  };

  return (
    <Modal
      width={520}
      open={open}
      title={intl.get('DEVICE_SETTINGS')}
      okText={intl.get('UPDATE')}
      onOk={onSave}
      cancelText={intl.get('CANCEL')}
      onCancel={onCancel}
      confirmLoading={isLoading}
      bodyStyle={{ maxHeight: 600, overflow: 'auto' }}
    >
      <Form form={form} layout='vertical'>
        <DeviceSettingContent deviceType={device.typeId} settings={settings} />
      </Form>
    </Modal>
  );
};

export default EditSettingModal;
