import { Col, Row, Space, Typography } from 'antd';
import moment from 'moment';
import * as React from 'react';
import { Device } from '../../../../types/device';
import { DeviceType } from '../../../../types/device_type';
import { isMobile } from '../../../../utils/deviceDetection';
import { SingleDeviceStatus } from '../../SingleDeviceStatus';
import DeviceUpgradeSpin from '../../spin/deviceUpgradeSpin';
const { Text } = Typography;

export const SingleDeviceDetail: React.FC<{ device: Device; upgradeStatus: any }> = ({
  device,
  upgradeStatus
}) => {
  return (
    <Row justify={'start'}>
      <Col span={isMobile ? 12 : 9}>
        <Row>
          <Col span={isMobile ? 24 : 8} className='ts-detail-label'>
            设备名称
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
            类型
          </Col>
          <Col span={isMobile ? 24 : 16} className='ts-detail-content'>{DeviceType.toString(device.typeId)}</Col>
        </Row>
      </Col>
      <Col span={isMobile ? 12 : 9}>
        <Row>
          <Col span={isMobile ? 24 : 8} className='ts-detail-label'>
            MAC地址
          </Col>
          <Col span={isMobile ? 24 : 16} className='ts-detail-content'>
            <Text copyable={{ text: device.macAddress, tooltips: ['复制', '复制成功'] }}>
              {device.macAddress.toUpperCase().macSeparator()}
            </Text>
          </Col>
        </Row>
      </Col>
      <Col span={isMobile ? 12 : 9}>
        <Row>
          <Col span={isMobile ? 24 : 8} className='ts-detail-label'>
            型号
          </Col>
          <Col span={isMobile ? 24 : 16} className='ts-detail-content'>
            {device.information.model ? device.information.model : '-'}
          </Col>
        </Row>
      </Col>
      <Col span={isMobile ? 12 : 9}>
        <Row>
          <Col span={isMobile ? 24 : 8} className='ts-detail-label'>
            状态
          </Col>
          <Col span={isMobile ? 24 : 16} className='ts-detail-content'>
            <SingleDeviceStatus alertStates={device.alertStates} state={device.state} />
          </Col>
        </Row>
      </Col>
      <Col span={isMobile ? 12 : 9}>
        <Row>
          <Col span={isMobile ? 24 : 8} className='ts-detail-label'>
            所属网络
          </Col>
          <Col span={isMobile ? 24 : 16} className='ts-detail-content'>{device.network ? device.network.name : '无'}</Col>
        </Row>
      </Col>
      <Col span={isMobile ? 12 : 9}>
        <Row>
          {' '}
          <Col span={isMobile ? 24 : 8} className='ts-detail-label'>
            电池电压(mV)
          </Col>
          <Col span={isMobile ? 24 : 16} className='ts-detail-content'>
            {device.state && device.typeId !== DeviceType.Gateway
              ? device.state.batteryVoltage
              : '-'}
          </Col>
        </Row>
      </Col>
      <Col span={isMobile ? 12 : 9}>
        <Row>
          <Col span={isMobile ? 24 : 8} className='ts-detail-label'>
            信号强度(dB)
          </Col>
          <Col span={isMobile ? 24 : 16} className='ts-detail-content'>{device.state ? device.state.signalLevel : '-'}</Col>
        </Row>
      </Col>
      <Col span={isMobile ? 12 : 9}>
        <Row>
          <Col span={isMobile ? 24 : 8} className='ts-detail-label'>
            固件版本号
          </Col>
          <Col span={isMobile ? 24 : 16} className='ts-detail-content'>
            {device.information.firmware_version ? device.information.firmware_version : '-'}
          </Col>
        </Row>
      </Col>
      <Col span={isMobile ? 12 : 9}>
        <Row>
          <Col span={isMobile ? 24 : 8} className='ts-detail-label'>
            最近连接时间
          </Col>
          <Col span={isMobile ? 24 : 16} className='ts-detail-content'>
            {device.state.connectedAt
              ? moment(device.state.connectedAt * 1000).format('YYYY-MM-DD HH:mm:ss')
              : '-'}
          </Col>
        </Row>
      </Col>
      <Col span={isMobile ? 12 : 9}>
        <Row>
          <Col span={isMobile ? 24 : 8} className='ts-detail-label'>
            硬件版本
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
              最近一次采集时间
            </Col>
            <Col span={isMobile ? 24 : 16} className='ts-detail-content'>
              {device.data && device.data.timestamp && device.data.timestamp > 0
                ? moment.unix(device.data.timestamp).local().format('YYYY-MM-DD HH:mm:ss')
                : '-'}
            </Col>
          </Row>
        </Col>
      )}
      {device.typeId === DeviceType.Gateway && (
        <Col span={isMobile ? 12 : 9}>
          <Row>
            <Col span={isMobile ? 24 : 8} className='ts-detail-label'>
              IP地址
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
                    访问管理界面
                  </a>
                </Space>
              ) : (
                '-'
              )}
            </Col>
          </Row>
        </Col>
      )}
    </Row>
  );
};
