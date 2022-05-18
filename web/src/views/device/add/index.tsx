import { Button, Col, Form, Input, Result, Row, Space } from 'antd';
import { Content } from 'antd/es/layout/layout';
import { useState } from 'react';
import '../index.css';
import {
  AddDeviceRequest,
  GetDefaultDeviceSettingsRequest
} from '../../../apis/device';
import ShadowCard from '../../../components/shadowCard';
import MyBreadcrumb from '../../../components/myBreadcrumb';
import { defaultValidateMessages, Normalizes, Rules } from '../../../constants/validator';
import NetworkSelect from '../../../components/select/networkSelect';
import DeviceSelect from '../../../components/select/deviceSelect';
import DeviceTypeSelect from '../../../components/select/deviceTypeSelect';
import { DeviceSetting } from '../../../types/device_setting';
import DeviceSettingFormItem from '../../../components/formItems/deviceSettingFormItem';
import { isMobile } from '../../../utils/deviceDetection';

const AddDevicePage = () => {
  const [deviceSettings, setDeviceSettings] = useState<DeviceSetting[]>();
  const [network, setNetwork] = useState<number>();
  const [success, setSuccess] = useState<boolean>(false);
  const [form] = Form.useForm();

  const fetchDeviceDefaultSettings = (type: any) => {
    GetDefaultDeviceSettingsRequest(type).then(setDeviceSettings);
  };

  const onSave = () => {
    form.validateFields().then((values) => {
      AddDeviceRequest(values).then((_) => setSuccess(true));
    });
  };

  return (
    <>
      <Content>
        <MyBreadcrumb />
        <ShadowCard>
          {success && (
            <Result
              status='success'
              title='设备创建成功!'
              subTitle='您可以返回设备列表查看设备信息或者继续创建设备'
              extra={[
                <Button
                  type='primary'
                  key='devices'
                  onClick={() => {
                    window.location.hash = 'device-management?locale=devices';
                  }}
                >
                  返回设备列表
                </Button>,
                <Button
                  key='add'
                  onClick={() => {
                    form.resetFields();
                    setSuccess(false);
                  }}
                >
                  继续创建设备
                </Button>
              ]}
            />
          )}
          <Row justify='space-between' hidden={success}>
            <Col span={isMobile ? 24 : 16}>
              <Row>
                <Col span={isMobile ? 24 : 20}>
                  <Form
                    form={form}
                    labelCol={{ span: 8 }}
                    validateMessages={defaultValidateMessages}
                  >
                    <fieldset>
                      <legend>基本信息</legend>
                      <Form.Item label='设备名称' name='name' rules={[Rules.range(4, 20)]}>
                        <Input placeholder={'请输入设备名称'} />
                      </Form.Item>
                      <Form.Item
                        label='设备MAC地址'
                        normalize={Normalizes.macAddress}
                        required
                        name='mac_address'
                        rules={[Rules.macAddress]}
                      >
                        <Input placeholder={`请输入设备MAC地址`} />
                      </Form.Item>
                    </fieldset>
                    <fieldset>
                      <legend>设备类型</legend>
                      <Form.Item label={'设备类型'} name={'type'} rules={[Rules.required]}>
                        <DeviceTypeSelect
                          placeholder={'请选择设备类型'}
                          onChange={fetchDeviceDefaultSettings}
                        />
                      </Form.Item>
                      <Form.Item label={'所属网络'} name={'network'} rules={[Rules.required]}>
                        <NetworkSelect
                            placeholder={'请选择设备所属网络'}
                            onChange={(value) => {
                              setNetwork(value);
                              form.resetFields(['parent']);
                            }}
                        />
                      </Form.Item>
                      {network && (
                          <Form.Item label={'设备父节点'} name={'parent'} rules={[Rules.required]}>
                            <DeviceSelect
                                filters={{ network_id: network }}
                                placeholder={'请选择设备所属父节点'}
                            />
                          </Form.Item>
                      )}
                      {deviceSettings?.map((item) => (
                        <DeviceSettingFormItem value={item} editable={true} />
                      ))}
                    </fieldset>
                  </Form>
                </Col>
                <Col span={isMobile ? 24 : 20} style={{ textAlign: 'right' }}>
                  <Space>
                    <Button type={'primary'} onClick={onSave}>
                      保存
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
