import { Button, Col, Form, Input, Row, Select } from 'antd';
import * as React from 'react';
import { UpdateDeviceRequest } from '../../../../apis/device';
import DeviceSelect from '../../../../components/select/deviceSelect';
import NetworkSelect from '../../../../components/select/networkSelect';
import { Normalizes, Rules } from '../../../../constants/validator';
import { Device } from '../../../../types/device';
import { DeviceType } from '../../../../types/device_type';
import intl from 'react-intl-universal';
import { FormInputItem } from '../../../../components/formInputItem';
import { WIRELESS_HART_POLLING_PERIOD } from '../../../../constants';

interface BasicSettingsProps {
  device: Device;
  onUpdate: () => void;
}

export const BasicSettings: React.FC<BasicSettingsProps> = ({ device, onUpdate }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [form] = Form.useForm();
  const [network, setNetwork] = React.useState<number>();
  React.useEffect(() => {
    if (device.network) setNetwork(device.network.id);
    form.setFieldsValue({
      name: device.name,
      mac_address: device.macAddress,
      network: device.network && device.network.id,
      parent: device.parent,
      ip_address: device.ipAddress,
      ip_port: device.ipPort,
      polling_period: device.pollingPeriod,
      tag: device.tag
    });
  }, [form, device]);

  const renderNetworkFormItem = () => {
    if (DeviceType.isNB(device.typeId) || DeviceType.isMultiChannel(device.typeId)) {
      return <></>;
    }
    return (
      <>
        <Form.Item label={intl.get('NETWORK_BELONG_TO')} name={'network'} rules={[Rules.required]}>
          <NetworkSelect
            placeholder={intl.get('PLEASE_SELECT_NETWORK_BELONG_TO')}
            onChange={(value) => {
              setNetwork(value);
              form.resetFields(['parent']);
            }}
          />
        </Form.Item>
        {network && (
          <Form.Item label={intl.get('PARENT')} name={'parent'} rules={[Rules.required]}>
            <DeviceSelect
              filters={{ network_id: network }}
              placeholder={intl.get('PLEASE_SELECT_PARENT')}
              dispalyField='macAddress'
            />
          </Form.Item>
        )}
      </>
    );
  };

  return (
    <>
      <Row justify={'start'}>
        <Col xxl={8} xl={10} xs={24}>
          <Form form={form} labelCol={{ xl: 7, xxl: 6 }}>
            <FormInputItem
              label={intl.get('DEVICE_NAME')}
              name='name'
              requiredMessage={intl.get('PLEASE_ENTER_DEVICE_NAME')}
              lengthLimit={{ min: 4, max: 20, label: intl.get('DEVICE_NAME') }}
            >
              <Input placeholder={intl.get('PLEASE_ENTER_DEVICE_NAME')} />
            </FormInputItem>
            {device && device.typeId !== DeviceType.Gateway && (
              <Form.Item
                label={intl.get('MAC_ADDRESS')}
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
                normalize={Normalizes.macAddress}
                required
              >
                <Input placeholder={intl.get('PLEASE_ENTER_MAC_ADDRESS')} />
              </Form.Item>
            )}
            {device && device.typeId !== DeviceType.Gateway && device.typeId !== DeviceType.Router && (
              <FormInputItem
                label={intl.get('DEVICE_TAG')}
                name='tag'
                requiredMessage={intl.get('PLEASE_ENTER_SOMETHING', {
                  something: intl.get('DEVICE_TAG')
                })}
                lengthLimit={{ min: 4, max: 20, label: intl.get('DEVICE_TAG') }}
              >
                <Input
                  placeholder={intl.get('PLEASE_ENTER_SOMETHING', {
                    something: intl.get('DEVICE_TAG')
                  })}
                />
              </FormInputItem>
            )}
            {device && device.typeId === DeviceType.Gateway && (
              <>
                <FormInputItem
                  label={intl.get('IP_ADDRESS')}
                  name='ip_address'
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
                  name='ip_port'
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
                <Form.Item label={intl.get('POLLING_PERIOD')} name='polling_period'>
                  <Select>
                    {WIRELESS_HART_POLLING_PERIOD.map(({ value, text }) => (
                      <Select.Option value={value} key={value}>
                        {intl.get(text)}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </>
            )}
            {device && device.typeId !== DeviceType.Gateway && renderNetworkFormItem()}
          </Form>
        </Col>
      </Row>
      <Row justify={'start'}>
        <Col xl={10} xxl={8} xs={24}>
          <Row justify={'end'}>
            <Col>
              <Button
                type={'primary'}
                loading={isLoading}
                onClick={() => {
                  form.validateFields().then((values) => {
                    setIsLoading(true);
                    UpdateDeviceRequest(device.id, values).then((_) => {
                      setIsLoading(false);
                      onUpdate();
                    });
                  });
                }}
              >
                {intl.get('SAVE')}
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
};
