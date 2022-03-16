import { InfoCircleOutlined } from '@ant-design/icons';
import { Col, Popover, Row, Statistic } from 'antd';
import * as React from 'react';
import ShadowCard from '../../components/shadowCard';
import { FIRST_CLASS_PROPERTIES } from '../../constants/field';
import usePermission, { Permission } from '../../permission/permission';
import { Device } from '../../types/device';
import { DeviceType } from '../../types/device_type';
import { Property } from '../../types/property';
import DeviceUpgradeSpin from './spin/deviceUpgradeSpin';
import { SingleDeviceStatus } from './SingleDeviceStatus';

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
  
  const transformData = (values: any, properties: Property[]) => {
    const fields = Object.keys(values);
    if (fields.length === 0 || fields.map((field) => values[field]).every((val) => !val)) return [];
    let data: any = [];
    const firstClassProperties = properties.filter((pro) => {
      const property = FIRST_CLASS_PROPERTIES.find((pro) => pro.typeId === typeId);
      return property ? property.properties.find((item) => item === pro.key) : false;
    });
    fields.forEach((field) => {
      const property = firstClassProperties.find((pro) =>
        pro.fields.find((subpro) => subpro.key === field)
      );
      if (property && !data.find((pro: any) => pro.key === property.key)) {
        data.push({
          ...property,
          fields: property.fields.map((item) => ({ ...item, value: values[field] }))
        });
      }
    });
    if (data.length > 0) data = data.sort((pro1: any, pro2: any) => pro1.sort - pro2.sort);
    return data;
  };
  const renderStatistic = () => {
    if (typeId === DeviceType.Gateway || typeId === DeviceType.Router) return null;
    const data = transformData(values, properties);
    if (data.length === 0)
      return <p style={{ color: 'rgba(0,0,0,.45)', textAlign: 'center' }}>暂无数据</p>;
    return (
      <Row justify='center'>
        {data.map((attr: any, index: number) => {
          if (index > 2) return null;
          const field = attr.fields[0];
          return (
            <Col span={7}>
              <Statistic
                title={`${attr.name !== field.name ? `${attr.name}${field.name}` : field.name}${
                  attr.unit ? `(${attr.unit})` : ''
                }`}
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
