import { Device } from '../../../../types/device';
import { FC, useEffect, useState } from 'react';
import { GetDeviceSettingRequest, UpdateDeviceSettingRequest } from '../../../../apis/device';
import '../../index.css';
import { Button, Col, Form, Row, Skeleton } from 'antd';
import { DeviceSetting } from '../../../../types/device_setting';
import { defaultValidateMessages } from '../../../../constants/validator';
import { DeviceType } from '../../../../types/device_type';
import { DeviceSettingContent } from '../../DeviceSettingContent';
import { processArrayValuesInSensorSetting } from '../../../../components/formItems/deviceSettingFormItem';
import intl from 'react-intl-universal';

export interface DeviceSettingsProps {
  device: Device;
}

const DeviceSettings: FC<DeviceSettingsProps> = ({ device }) => {
  const [settings, setSettings] = useState<DeviceSetting[]>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [form] = Form.useForm();

  useEffect(() => {
    setIsLoading(true);
    GetDeviceSettingRequest(device.id).then((data) => {
      setIsLoading(false);
      setSettings(data);
    });
  }, [device]);

  const onSave = () => {
    form.validateFields().then((values) => {
      UpdateDeviceSettingRequest(device.id, {
        ...values,
        sensors: processArrayValuesInSensorSetting(values.sensors)
      }).then();
    });
  };

  return (
    <Skeleton loading={isLoading}>
      <Row justify={'start'}>
        <Col xxl={10} xl={13} xs={24}>
          <Form form={form} labelCol={{ xl: 7, xxl: 6 }} validateMessages={defaultValidateMessages}>
            <DeviceSettingContent deviceType={device.typeId} settings={settings} />
          </Form>
        </Col>
      </Row>
      <Row justify={'start'}>
        <Col xl={13} xxl={10} xs={24}>
          <Row justify={'end'}>
            <Col>
              {device.typeId !== DeviceType.Router && (
                <Button type={'primary'} onClick={onSave}>
                  {intl.get('SAVE')}
                </Button>
              )}
            </Col>
          </Row>
        </Col>
      </Row>
    </Skeleton>
  );
};

export default DeviceSettings;
