import { Form, Input, Row, Col, Button } from 'antd';
import * as React from 'react';
import { UpdateDeviceRequest } from '../../../../apis/device';
import DeviceSelect from '../../../../components/select/deviceSelect';
import NetworkSelect from '../../../../components/select/networkSelect';
import { defaultValidateMessages, Normalizes, Rules } from '../../../../constants/validator';
import { Device } from '../../../../types/device';
import { DeviceType } from '../../../../types/device_type';

export const BasicSettings: React.FC<{ device: Device; onUpdate: () => void }> = ({
  device,
  onUpdate
}) => {
  const [isloading, setIsLoading] = React.useState(false);
  const [form] = Form.useForm();
  const [network, setNetwork] = React.useState<number>();
  React.useEffect(() => {
    if(device.network) setNetwork(device.network.id)
    form.setFieldsValue({ name: device.name, mac_address: device.macAddress, network: device.network && device.network.id, parent: device.parent });
  }, [form, device]);

  return (
    <>
      <Row justify={'start'}>
        <Col xxl={8} xl={10} xs={24}>
          <Form form={form} labelCol={{ xl: 7, xxl: 6 }} validateMessages={defaultValidateMessages}>
            <Form.Item label={'设备名称'} name={'name'} rules={[Rules.range(4, 20)]}>
              <Input placeholder={'请输入设备名称'} />
            </Form.Item>
            <Form.Item
              label={'设备MAC地址'}
              name='mac_address'
              rules={[Rules.macAddress]}
              normalize={Normalizes.macAddress}
              required
            >
              <Input placeholder={'请输入设备MAC地址'} />
            </Form.Item>
            {device && device.typeId !== DeviceType.Gateway && (
              <>
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
                      dispalyField='macAddress'
                    />
                  </Form.Item>
                )}
              </>
            )}
          </Form>
        </Col>
      </Row>
      <Row justify={'start'}>
        <Col xl={10} xxl={8} xs={24}>
          <Row justify={'end'}>
            <Col>
              <Button
                type={'primary'}
                loading={isloading}
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
                保存
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
};
