import { Button, Col, Form, Input, Result, Row, Space } from 'antd';
import { Content } from 'antd/es/layout/layout';
import { useState } from 'react';
import { AddDeviceRequest, GetDefaultDeviceSettingsRequest } from '../../../apis/device';
import ShadowCard from '../../../components/shadowCard';
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
import { PageTitle } from '../../../components/pageTitle';
import intl from 'react-intl-universal';
import { FormInputItem } from '../../../components/formInputItem';
import { SelfLink } from '../../../components/selfLink';

const AddDevicePage = () => {
  const [deviceSettings, setDeviceSettings] = useState<DeviceSetting[]>();
  const [deviceType, setDeviceType] = useState<DeviceType>();
  const [network, setNetwork] = useState<number>();
  const [success, setSuccess] = useState<boolean>(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const fetchDeviceDefaultSettings = (type: any) => {
    setDeviceType(type);
    setDeviceSettings([]);
    GetDefaultDeviceSettingsRequest(type).then(setDeviceSettings);
  };

  const onSave = () => {
    form.validateFields().then((values) => {
      AddDeviceRequest({
        ...values,
        sensors: processArrayValuesInSensorSetting(values.sensors)
      }).then((_) => setSuccess(true));
    });
  };

  const renderNetwork = () => {
    if (!DeviceType.isNB(deviceType) && !DeviceType.isMultiChannel(deviceType ?? 0)) {
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
    <>
      <Content>
        <PageTitle
          items={[
            { title: <SelfLink to='/devices'>{intl.get('MENU_DEVICE_LSIT')}</SelfLink> },
            { title: intl.get('CREATE_DEVICE') }
          ]}
        />
        <ShadowCard>
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
                    navigate('/devices');
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
              <Row>
                <Col span={isMobile ? 24 : 20}>
                  <Form form={form} labelCol={{ span: 8 }}>
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
                      {deviceType && !DeviceType.isMultiChannel(deviceType) && (
                        <DeviceSettingContent settings={deviceSettings} deviceType={deviceType} />
                      )}
                    </fieldset>
                    {deviceType && DeviceType.isMultiChannel(deviceType) && (
                      <DeviceSettingContent settings={deviceSettings} deviceType={deviceType} />
                    )}
                  </Form>
                </Col>
                <Col span={isMobile ? 24 : 20} style={{ textAlign: 'right' }}>
                  <Space>
                    <Button type={'primary'} onClick={onSave}>
                      {intl.get('SAVE')}
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Col>
          </Row>
        </ShadowCard>
      </Content>
    </>
  );
};

export default AddDevicePage;
