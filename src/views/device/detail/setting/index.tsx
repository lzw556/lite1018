import { Button, Col, Form, Radio, Row } from 'antd';
import { Device } from '../../../../types/device';
import * as React from 'react';
import DeviceSettings from './deviceSettings';
import { DeviceType } from '../../../../types/device_type';
import { BasicSettings } from './basicSettings';
import intl from 'react-intl-universal';
import { WsnFormItem } from '../../add/wsnFormItem';
import { generateColProps } from '../../../../utils/grid';
import { Network } from '../../../../types/network';
import { UpdateNetworkRequest } from '../../../../apis/network';

export interface SettingPageProps {
  device: Device;
  onUpdate: () => void;
  network?: Network;
}

const SettingPage: React.FC<SettingPageProps> = ({ device, onUpdate, network }) => {
  const [form] = Form.useForm();
  const [type, setType] = React.useState('basic');
  const options = [];
  const { typeId } = device;
  if (DeviceType.hasDeviceSettings(typeId)) {
    options.push(
      { label: intl.get('BASIC_INFORMATION'), value: 'basic' },
      { label: intl.get('DEVICE_SETTINGS'), value: 'device' }
    );
    if (typeId === DeviceType.Gateway && network) {
      options.push({ label: intl.get('wireless.network.settings'), value: 'wsn' });
    }
  }
  if (options.length === 0) {
    return <BasicSettings device={device} onUpdate={onUpdate} />;
  } else {
    return (
      <>
        <Radio.Group
          style={{ marginBottom: 12 }}
          options={options}
          onChange={(e) => setType(e.target.value)}
          value={type}
          optionType='button'
          buttonStyle='solid'
        />
        {type === 'basic' && <BasicSettings device={device} onUpdate={onUpdate} />}
        {type === 'device' && <DeviceSettings device={device} />}
        {type === 'wsn' && network && (
          <Row>
            <Col {...generateColProps({ md: 24, lg: 24, xl: 16, xxl: 12 })}>
              <Form
                form={form}
                labelCol={{ lg: 12, xl: 10, xxl: 9 }}
                initialValues={{
                  mode: network.mode,
                  wsn: {
                    communication_period: network.communicationPeriod,
                    communication_period_2: network.communicationPeriod2,
                    communication_offset: network.communicationOffset,
                    group_size: network.groupSize,
                    group_size_2: network.groupSize2,
                    interval_cnt: network.intervalCnt
                  }
                }}
              >
                <WsnFormItem />
                <Form.Item
                  wrapperCol={{ lg: { offset: 12 }, xl: { offset: 10 }, xxl: { offset: 9 } }}
                >
                  <Button
                    type='primary'
                    onClick={() => {
                      form.validateFields().then((values) => {
                        UpdateNetworkRequest(network.id, { ...values, name: network.name }).then(
                          () => {
                            onUpdate();
                          }
                        );
                      });
                    }}
                  >
                    {intl.get('SAVE')}
                  </Button>
                </Form.Item>
              </Form>
            </Col>
          </Row>
        )}
      </>
    );
  }
};

export default SettingPage;
