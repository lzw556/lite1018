import { InfoCircleOutlined } from '@ant-design/icons';
import { Col, Popover, Row, Statistic, Typography } from 'antd';
import * as React from 'react';
import ShadowCard from '../../components/shadowCard';
import { FIRST_CLASS_PROPERTIES } from '../../constants/field';
import usePermission, { Permission } from '../../permission/permission';
import { Device } from '../../types/device';
import { DeviceType } from '../../types/device_type';
import { Property } from '../../types/property';
import DeviceUpgradeSpin from './spin/deviceUpgradeSpin';
import { SingleDeviceStatus } from './SingleDeviceStatus';
import { getValueOfFirstClassProperty } from './util';

const { Text } = Typography;

export const SingleDeviceInfo: React.FC<{ device: Device; actions?: React.ReactNode[] }> = ({
  device,
  actions
}) => {
  const { hasPermission } = usePermission();
  const {
    state: { batteryVoltage, signalLevel },
    name,
    typeId,
    macAddress,
    data: { values },
    properties,
    id,
    upgradeStatus,
    alertStates = []
  } = device;
  const Title = () => {
    const deviceName = (
      <>
        {hasPermission(Permission.DeviceDetail) ? (
          <a href={`#/device-management?locale=devices/deviceDetail&id=${id}&displayDevicesByCard`}>
            {name}
          </a>
        ) : (
          name
        )}
        {upgradeStatus && <DeviceUpgradeSpin status={upgradeStatus} />}
      </>
    );

    return (
      <>
        <SingleDeviceStatus alertStates={alertStates} state={device.state} />
        {deviceName}
      </>
    );
  };

  const renderStatistic = () => {
    if (typeId === DeviceType.Gateway || typeId === DeviceType.Router) return null;
    const data = getValueOfFirstClassProperty(values, properties, typeId);
    if (data.length === 0)
      return <p style={{ color: 'rgba(0,0,0,.45)', textAlign: 'center' }}>暂无数据</p>;
    return (
      <Row justify='center'>
        {data.map((attr: any, index: number) => {
          if (index > 2) return null;
          const field = attr.fields.find((field: any) => field.important);
          return (
            <Col span={7}>
              <Statistic
                title={
                  <Text
                    ellipsis={true}
                    title={`${attr.name}${attr.unit ? `(${attr.unit})` : ''}`}
                  >{`${attr.name}${attr.unit ? `(${attr.unit})` : ''}`}</Text>
                }
                value={
                  Number.isInteger(field.value) ? field.value : field.value.toFixed(attr.precision)
                }
              />
            </Col>
          );
        })}
      </Row>
    );
  };

  return (
    <ShadowCard
      title={
        <Row justify='space-between'>
          <Col>
            <Title />
          </Col>
        </Row>
      }
      bordered={true}
      style={{ marginBottom: 10, marginRight: 10 }}
      actions={[
        <Popover
          trigger='click'
          content={
            <>
              <Row justify='space-between' align='middle'>
                <Col>
                  <span style={{ paddingRight: 8, lineHeight: '30px', color: 'rgba(0,0,0,.45)' }}>
                    MAC地址
                  </span>
                </Col>
                <Col>
                  <span>{macAddress.toUpperCase().macSeparator()}</span>
                </Col>
              </Row>
              <Row justify='space-between' align='middle'>
                <Col>
                  <span style={{ paddingRight: 8, lineHeight: '30px', color: 'rgba(0,0,0,.45)' }}>
                    电池电压(mV)
                  </span>
                </Col>
                <Col>
                  <span>{batteryVoltage}</span>
                </Col>
              </Row>
              <Row justify='space-between' align='middle'>
                <Col>
                  <span style={{ paddingRight: 8, lineHeight: '30px', color: 'rgba(0,0,0,.45)' }}>
                    信号强度(dB)
                  </span>
                </Col>
                <Col>
                  <span>{signalLevel}</span>
                </Col>
              </Row>
            </>
          }
        >
          <InfoCircleOutlined />
        </Popover>,
        ...(actions || [])
      ]}
    >
      {renderStatistic()}
    </ShadowCard>
  );
};
