import { Breadcrumb, Button, Col, Form, Input, Result, Row } from 'antd';
import { useState } from 'react';
import { AddDeviceRequest, GetDefaultDeviceSettingsRequest } from '../../../apis/device';
import { Card, Flex } from '../../../components';
import { Normalizes } from '../../../constants/validator';
import NetworkSelect from '../../../components/select/networkSelect';
import DeviceSelect from '../../../components/select/deviceSelect';
import DeviceTypeSelect from '../../../components/select/deviceTypeSelect';
import { DeviceSetting } from '../../../types/device_setting';
import { processArrayValuesInSensorSetting } from '../../../components/formItems/deviceSettingFormItem';
import { isMobile } from '../../../utils/deviceDetection';
import { DeviceType } from '../../../types/device_type';
import { DeviceSettingContent } from '../DeviceSettingContent';
import { useNavigate } from 'react-router-dom';
import intl from 'react-intl-universal';
import { FormInputItem } from '../../../components/formInputItem';
import { SelfLink } from '../../../components/selfLink';
import { useContext, VIRTUAL_ROOT_DEVICE } from '..';
import { WsnFormItem } from './wsnFormItem';
import { NetworkProvisioningMode } from '../../../types/network';
import { DEFAULT_WSN_SETTING } from '../../../types/wsn_setting';
import { CreateNetworkRequest } from '../../../apis/network';

const AddDevicePage = () => {
  const [deviceSettings, setDeviceSettings] = useState<DeviceSetting[]>();
  const [deviceType, setDeviceType] = useState<DeviceType>();
  const [network, setNetwork] = useState<number>();
  const [success, setSuccess] = useState<boolean>(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const devicesContext = useContext();

  const fetchDeviceDefaultSettings = (type: any) => {
    setDeviceType(type);
    if (type === DeviceType.Gateway) {
      form.setFieldsValue({
        mode: NetworkProvisioningMode.Mode2,
        wsn: DEFAULT_WSN_SETTING
      });
    }
    setDeviceSettings([]);
    GetDefaultDeviceSettingsRequest(type).then((deviceSettings: DeviceSetting[]) => {
      deviceSettings.forEach((s) => {
        form.setFieldValue([s.category, s.key], s.key === 'sensor_flags' ? [s.value] : s.value);
      });
      setDeviceSettings(deviceSettings);
    });
  };

  const onSave = () => {
    form.validateFields().then((values) => {
      if (values) {
        if (values.type === DeviceType.Gateway) {
          CreateNetworkRequest({
            ...values,
            gateway: { mac_address: values.mac_address, type: values.type }
          }).then((_) => {
            setSuccess(true);
            devicesContext.refresh(true);
          });
        } else {
          AddDeviceRequest({
            ...values,
            sensors: processArrayValuesInSensorSetting(values.sensors)
          }).then((_) => {
            setSuccess(true);
            devicesContext.refresh(true);
          });
        }
      }
    });
  };

  const renderNetwork = () => {
    if (!DeviceType.isRootDevice(deviceType ?? 0)) {
      return (
        <>
          <Form.Item
            label={intl.get('NETWORK_BELONG_TO')}
            name={'network'}
            rules={[{ required: true, message: intl.get('PLEASE_SELECT_NETWORK_BELONG_TO') }]}
          >
            <NetworkSelect
              placeholder={intl.get('PLEASE_SELECT_NETWORK_BELONG_TO')}
              onChange={(value) => {
                setNetwork(value);
                form.resetFields(['parent']);
              }}
            />
          </Form.Item>
          {network && (
            <Form.Item
              label={intl.get('PARENT')}
              name={'parent'}
              rules={[{ required: true, message: intl.get('PLEASE_SELECT_PARENT') }]}
            >
              <DeviceSelect
                filters={{ network_id: network }}
                placeholder={intl.get('PLEASE_SELECT_PARENT')}
              />
            </Form.Item>
          )}
        </>
      );
    }
    return <></>;
  };

  return (
    <Card
      title={
        <Breadcrumb
          items={[
            { title: <SelfLink to='/devices/0'>{VIRTUAL_ROOT_DEVICE.name}</SelfLink> },
            { title: intl.get('CREATE_DEVICE') }
          ]}
        />
      }
    >
      {success && (
        <Result
          status='success'
          title={intl.get('CREATED_SUCCESSFUL')}
          subTitle={intl.get('DEVICE_CREATED_NEXT_PROMPT')}
          extra={[
            <Button
              type='primary'
              key='devices'
              onClick={() => {
                navigate('/devices/0');
              }}
            >
              {intl.get('RETURN_TO_DEVICE_LIST')}
            </Button>,
            <Button
              key='add'
              onClick={() => {
                form.resetFields();
                setSuccess(false);
              }}
            >
              {intl.get('CONTINUE_TO_CREATE_DEVICE')}
            </Button>
          ]}
        />
      )}
      <Row justify='space-between' hidden={success}>
        <Col span={isMobile ? 24 : 16}>
          <Form form={form} labelCol={{ span: 8 }}>
            <div style={{ maxHeight: 550, overflowY: 'auto' }}>
              <fieldset>
                <legend>{intl.get('BASIC_INFORMATION')}</legend>
                <FormInputItem
                  label={intl.get('DEVICE_NAME')}
                  name='name'
                  requiredMessage={intl.get('PLEASE_ENTER_DEVICE_NAME')}
                  lengthLimit={{ min: 4, max: 20, label: intl.get('DEVICE_NAME') }}
                >
                  <Input placeholder={intl.get('PLEASE_ENTER_DEVICE_NAME')} />
                </FormInputItem>
                <Form.Item
                  label={intl.get('MAC_ADDRESS')}
                  normalize={Normalizes.macAddress}
                  required
                  name='mac_address'
                  rules={[
                    {
                      required: true,
                      message: intl.get('PLEASE_ENTER_MAC_ADDRESS')
                    },
                    {
                      pattern: /^([0-9a-fA-F]{2})(([0-9a-fA-F]{2}){5})$/,
                      message: intl.get('MAC_ADDRESS_IS_INVALID')
                    }
                  ]}
                >
                  <Input placeholder={intl.get('PLEASE_ENTER_MAC_ADDRESS')} />
                </Form.Item>
              </fieldset>
              <fieldset>
                <legend>{intl.get('DEVICE_TYPE')}</legend>
                <Form.Item
                  label={intl.get('DEVICE_TYPE')}
                  name={'type'}
                  rules={[{ required: true, message: intl.get('PLEASE_SELECT_DEVICE_TYPE') }]}
                >
                  <DeviceTypeSelect
                    placeholder={intl.get('PLEASE_SELECT_DEVICE_TYPE')}
                    onChange={fetchDeviceDefaultSettings}
                  />
                </Form.Item>
                {deviceType && renderNetwork()}
                {deviceType &&
                  DeviceType.hasDeviceSettings(deviceType) &&
                  !DeviceType.hasGroupedSettings(deviceType) && (
                    <DeviceSettingContent settings={deviceSettings} deviceType={deviceType} />
                  )}
              </fieldset>
              {deviceType && deviceType === DeviceType.Gateway && (
                <fieldset>
                  <legend>{intl.get('wireless.network.settings')}</legend>
                  <WsnFormItem />
                </fieldset>
              )}
              {deviceType && DeviceType.hasGroupedSettings(deviceType) && (
                <DeviceSettingContent settings={deviceSettings} deviceType={deviceType} />
              )}
            </div>
            <Flex>
              <Button type={'primary'} onClick={onSave}>
                {intl.get('SAVE')}
              </Button>
            </Flex>
          </Form>
        </Col>
      </Row>
    </Card>
  );
};

export default AddDevicePage;
