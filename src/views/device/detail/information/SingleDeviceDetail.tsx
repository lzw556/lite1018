import { Col, Row, Space, Typography } from 'antd';
import dayjs from '../../../../utils/dayjsUtils';
import * as React from 'react';
import { Device } from '../../../../types/device';
import { DeviceType } from '../../../../types/device_type';
import { isMobile } from '../../../../utils/deviceDetection';
import { SingleDeviceStatus } from '../../SingleDeviceStatus';
import DeviceUpgradeSpin from '../../spin/deviceUpgradeSpin';
import intl from 'react-intl-universal';

const { Text } = Typography;

export const SingleDeviceDetail: React.FC<{ device: Device; upgradeStatus: any }> = ({
  device,
  upgradeStatus
}) => {
  const render = (isGateway: boolean) => {
    if (device.information.iccid_4g) {
      return (
        <Col span={isMobile ? 12 : 9}>
          <Row>
            <Col span={isMobile ? 24 : 8} className='ts-detail-label'>
              {intl.get('4G_CARD_NO')}
            </Col>
            <Col span={isMobile ? 24 : 16} className='ts-detail-content'>
              {device.information.iccid_4g}
            </Col>
          </Row>
        </Col>
      );
    } else if (device.information.ip_address) {
      return (
        <Col span={isMobile ? 12 : 9}>
          <Row>
            <Col span={isMobile ? 24 : 8} className='ts-detail-label'>
              {intl.get('IP_ADDRESS')}
            </Col>
            <Col span={isMobile ? 24 : 16} className='ts-detail-content'>
              {device.information.ip_address ? (
                <Space>
                  {device.information.ip_address}{' '}
                  <a
                    href={`http://${device.information.ip_address}`}
                    target={'_blank'}
                    style={{ fontSize: '10pt' }}
                  >
                    {intl.get('GO_TO_ADMIN_PORTAL')}
                  </a>
                </Space>
              ) : (
                '-'
              )}
            </Col>
          </Row>
        </Col>
      );
    }
  };

  return (
    <Row justify={'start'}>
      <Col span={isMobile ? 12 : 9}>
        <Row>
          <Col span={isMobile ? 24 : 8} className='ts-detail-label'>
            {intl.get('DEVICE_NAME')}
          </Col>
          <Col span={isMobile ? 24 : 16} className='ts-detail-content'>
            <Space>
              {device.name}
              {upgradeStatus && <DeviceUpgradeSpin status={upgradeStatus} />}
            </Space>
          </Col>
        </Row>
      </Col>
      <Col span={isMobile ? 12 : 9}>
        <Row>
          <Col span={isMobile ? 24 : 8} className='ts-detail-label'>
            {intl.get('TYPE')}
          </Col>
          <Col span={isMobile ? 24 : 16} className='ts-detail-content'>
            {intl.get(DeviceType.toString(device.typeId))}
          </Col>
        </Row>
      </Col>
      <Col span={isMobile ? 12 : 9}>
        <Row>
          <Col span={isMobile ? 24 : 8} className='ts-detail-label'>
            {intl.get('MAC_ADDRESS')}
          </Col>
          <Col span={isMobile ? 24 : 16} className='ts-detail-content'>
            <Text
              copyable={{
                text: device.macAddress,
                tooltips: [intl.get('COPY'), intl.get('COPY_SUCCEEDED')]
              }}
            >
              {device.macAddress.toUpperCase().macSeparator()}
            </Text>
          </Col>
        </Row>
      </Col>
      <Col span={isMobile ? 12 : 9}>
        <Row>
          <Col span={isMobile ? 24 : 8} className='ts-detail-label'>
            {intl.get('MODEL')}
          </Col>
          <Col span={isMobile ? 24 : 16} className='ts-detail-content'>
            {device.information.model ? device.information.model : '-'}
          </Col>
        </Row>
      </Col>
      <Col span={isMobile ? 12 : 9}>
        <Row>
          <Col span={isMobile ? 24 : 8} className='ts-detail-label'>
            {intl.get('STATUS')}
          </Col>
          <Col span={isMobile ? 24 : 16} className='ts-detail-content'>
            <SingleDeviceStatus alertStates={device.alertStates} state={device.state} />
          </Col>
        </Row>
      </Col>
      {device.state && !DeviceType.isMultiChannel(device.typeId) && (
        <Col span={isMobile ? 12 : 9}>
          <Row>
            <Col span={isMobile ? 24 : 8} className='ts-detail-label'>
              {intl.get('NETWORK_BELONG_TO')}
            </Col>
            <Col span={isMobile ? 24 : 16} className='ts-detail-content'>
              {device.network ? device.network.name : intl.get('NONE')}
            </Col>
          </Row>
        </Col>
      )}
      {device.state &&
        device.typeId !== DeviceType.Gateway &&
        !DeviceType.isMultiChannel(device.typeId) && (
          <Col span={isMobile ? 12 : 9}>
            <Row>
              <Col span={isMobile ? 24 : 8} className='ts-detail-label'>
                {intl.get('BATTERY_VOLTAGE')}(mV)
              </Col>
              <Col span={isMobile ? 24 : 16} className='ts-detail-content'>
                {device.state ? device.state.batteryVoltage : '-'}
              </Col>
            </Row>
          </Col>
        )}
      <Col span={isMobile ? 12 : 9}>
        <Row>
          <Col span={isMobile ? 24 : 8} className='ts-detail-label'>
            {intl.get('SIGNAL_STRENGTH')}(dB)
          </Col>
          <Col span={isMobile ? 24 : 16} className='ts-detail-content'>
            {device.state ? device.state.signalLevel : '-'}
          </Col>
        </Row>
      </Col>
      <Col span={isMobile ? 12 : 9}>
        <Row>
          <Col span={isMobile ? 24 : 8} className='ts-detail-label'>
            {intl.get('HARDWARE_VERSION')}
          </Col>
          <Col span={isMobile ? 24 : 16} className='ts-detail-content'>
            {device.information.firmware_version ? device.information.firmware_version : '-'}
          </Col>
        </Row>
      </Col>
      <Col span={isMobile ? 12 : 9}>
        <Row>
          <Col span={isMobile ? 24 : 8} className='ts-detail-label'>
            {intl.get('LAST_CONNECTION_TIME')}
          </Col>
          <Col span={isMobile ? 24 : 16} className='ts-detail-content'>
            {device.state.connectedAt
              ? dayjs(device.state.connectedAt * 1000).format('YYYY-MM-DD HH:mm:ss')
              : '-'}
          </Col>
        </Row>
      </Col>
      <Col span={isMobile ? 12 : 9}>
        <Row>
          <Col span={isMobile ? 24 : 8} className='ts-detail-label'>
            {intl.get('PRODUCT_ID')}
          </Col>
          <Col span={isMobile ? 24 : 16} className='ts-detail-content'>
            {device.information.product_id ? device.information.product_id : '-'}
          </Col>
        </Row>
      </Col>
      {device.typeId !== DeviceType.Gateway && device.typeId !== DeviceType.Router && (
        <Col span={isMobile ? 12 : 9}>
          <Row>
            <Col span={isMobile ? 24 : 8} className='ts-detail-label'>
              {intl.get('LAST_SAMPLING_TIME')}
            </Col>
            <Col span={isMobile ? 24 : 16} className='ts-detail-content'>
              {device.data && device.data.timestamp && device.data.timestamp > 0
                ? dayjs.unix(device.data.timestamp).local().format('YYYY-MM-DD HH:mm:ss')
                : '-'}
            </Col>
          </Row>
        </Col>
      )}
      {render(device.typeId === DeviceType.Gateway)}
    </Row>
  );
};
