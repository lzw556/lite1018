import { Col, Row, Statistic, Typography } from 'antd';
import * as React from 'react';
import ShadowCard from '../../components/shadowCard';
import usePermission, { Permission } from '../../permission/permission';
import { Device } from '../../types/device';
import { DeviceType } from '../../types/device_type';
import DeviceUpgradeSpin from './spin/deviceUpgradeSpin';
import { SingleDeviceStatus } from './SingleDeviceStatus';
import { Filters, getValueOfFirstClassProperty, PagedOption } from './util';
import { Link } from 'react-router-dom';

const { Text } = Typography;

export const SingleDeviceInfo: React.FC<{
  device: Device;
  actions?: React.ReactNode[];
  rememberdState: { filters?: Filters; pagedOptions: PagedOption };
}> = ({ device, actions, rememberdState }) => {
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
          <Link
            to={{
              pathname: `device-management`,
              search: `?locale=device-monitor/deviceDetail&id=${id}`,
              state: rememberdState
            }}
          >
            {name}
          </Link>
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
      return (
        <div className='ant-statistic'>
          <div className='ant-statistic-title'>暂无数据</div>
          <div className='ant-statistic-content' style={{ visibility: 'hidden' }}>
            -100
          </div>
        </div>
      );
    return (
      <Row justify='center'>
        {data.map((attr: any, index: number) => {
          if (index > 2) return null;
          const field = attr.fields.find((field: any) => field.important);
          return (
            <Col span={8}>
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
    >
      {renderStatistic()}
    </ShadowCard>
  );
};
