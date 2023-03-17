import { Col, Row, Tag } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import { NameValueGroups } from '../../../components/name-values';
import ShadowCard from '../../../components/shadowCard';
import { Device } from '../../../types/device';
import { DeviceType } from '../../../types/device_type';
import dayjs from '../../../utils/dayjsUtils';
import { generateColProps } from '../../../utils/grid';
import { convertAlarmLevelToState, getAlarmLevelColor, getAlarmStateText } from '../../asset';
import { MonitoringPointRow } from '../types';

export const RelatedDevices = (point: MonitoringPointRow) => {
  const { bindingDevices: devices = [], alertLevel } = point;
  const [key, setKey] = React.useState(devices[0].macAddress);
  if (devices.length === 1) return <SingleDeviceInfo {...devices[0]} alertLevel={alertLevel} />;
  const contents: Record<string, JSX.Element> = {};
  devices.forEach((device) => {
    contents[device.macAddress] = <SingleDeviceInfo {...device} alertLevel={alertLevel} />;
  });

  return (
    <ShadowCard
      tabList={devices.map((device) => ({ key: device.macAddress, tab: device.name }))}
      onTabChange={(key) => {
        setKey(key);
      }}
    >
      {key && contents[key]}
    </ShadowCard>
  );
};

function SingleDeviceInfo(props: Device & { alertLevel?: number }) {
  const colProps = generateColProps({ xxl: 8, xl: 8, lg: 12, md: 12 });
  const { id, name, typeId, information, state, macAddress, data, alertLevel } = props;

  return (
    <ShadowCard>
      <Row>
        <Col {...colProps}>
          <NameValueGroups
            items={[{ name: '设备名称', value: <Link to={`/devices/${id}`}>{name}</Link> }]}
          />
        </Col>
        <Col {...colProps}>
          <NameValueGroups items={[{ name: '类型', value: DeviceType.toString(typeId) }]} />
        </Col>
        <Col {...colProps}>
          <NameValueGroups items={[{ name: '型号', value: information?.model ?? '-' }]} />
        </Col>
        <Col {...colProps}>
          <NameValueGroups
            items={[{ name: 'MAC地址', value: macAddress.toUpperCase().macSeparator() }]}
          />
        </Col>
        <Col {...colProps}>
          <NameValueGroups
            items={[{ name: '电池电压(mV)', value: state?.batteryVoltage ?? '-' }]}
          />
        </Col>
        <Col {...colProps}>
          <NameValueGroups items={[{ name: '信号强度(dB)', value: state?.signalLevel ?? '-' }]} />
        </Col>
        <Col {...colProps}>
          <NameValueGroups
            items={[
              {
                name: '状态',
                value: (
                  <Tag color={getAlarmLevelColor(convertAlarmLevelToState(alertLevel || 0))}>
                    {getAlarmStateText(convertAlarmLevelToState(alertLevel || 0))}
                  </Tag>
                )
              }
            ]}
          />
        </Col>
        <Col {...colProps}>
          <NameValueGroups
            items={[
              {
                name: '最近连接时间',
                value: state?.connectedAt
                  ? dayjs.unix(state.connectedAt).local().format('YYYY-MM-DD HH:mm:ss')
                  : '-'
              }
            ]}
          />
        </Col>
        <Col {...colProps}>
          <NameValueGroups
            items={[
              {
                name: '最近一次采集时间',
                value: data?.timestamp
                  ? dayjs.unix(data.timestamp).local().format('YYYY-MM-DD HH:mm:ss')
                  : '-'
              }
            ]}
          />
        </Col>
      </Row>
    </ShadowCard>
  );
}
