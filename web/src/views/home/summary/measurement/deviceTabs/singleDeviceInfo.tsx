import { Col, Row, Tag } from 'antd';
import moment from 'moment';
import * as React from 'react';
import ShadowCard from '../../../../../components/shadowCard';
import { Device } from '../../../../../types/device';
import { DeviceType } from '../../../../../types/device_type';
import { generateColProps } from '../../../common/utils';
import '../../../../../string-extension';
import { Link } from 'react-router-dom';
import {
  convertAlarmLevelToState,
  getAlarmLevelColor,
  getAlarmStateText
} from '../../../common/statisticsHelper';

export const SingleDeviceInfo: React.FC<Device & { alertLevel?: number }> = (props) => {
  const colProps = generateColProps({ xxl: 8, xl: 8, lg: 12, md: 12 });
  const { id, name, typeId, information, state, macAddress, data, alertLevel } = props;
  const { batteryVoltage, signalLevel, connectedAt } = state;
  return (
    <ShadowCard>
      <Row>
        <Col {...colProps}>
          <dl className='name-value-groups'>
            <div className='name-value'>
              <dt>设备名称</dt>
              <dd>
                <Link to={`/device-management?locale=devices/deviceDetail&id=${id}`}>{name}</Link>
              </dd>
            </div>
          </dl>
        </Col>
        <Col {...colProps}>
          <dl className='name-value-groups'>
            <div className='name-value'>
              <dt>类型</dt>
              <dd>{DeviceType.toString(typeId)}</dd>
            </div>
          </dl>
        </Col>
        <Col {...colProps}>
          <dl className='name-value-groups'>
            <div className='name-value'>
              <dt>型号</dt>
              <dd>{information && information.model ? information.model : '-'}</dd>
            </div>
          </dl>
        </Col>
        <Col {...colProps}>
          <dl className='name-value-groups'>
            <div className='name-value'>
              <dt>MAC地址</dt>
              <dd>{macAddress.toUpperCase().macSeparator()}</dd>
            </div>
          </dl>
        </Col>
        <Col {...colProps}>
          <dl className='name-value-groups'>
            <div className='name-value'>
              <dt>电池电压(mV)</dt>
              <dd>{state && typeId !== DeviceType.Gateway ? batteryVoltage : '-'}</dd>
            </div>
          </dl>
        </Col>
        <Col {...colProps}>
          <dl className='name-value-groups'>
            <div className='name-value'>
              <dt>信号强度(dB)</dt>
              <dd>{state && typeId !== DeviceType.Gateway ? signalLevel : '-'}</dd>
            </div>
          </dl>
        </Col>
        <Col {...colProps}>
          <dl className='name-value-groups'>
            <div className='name-value'>
              <dt>状态</dt>
              <dd>
                <Tag color={getAlarmLevelColor(convertAlarmLevelToState(alertLevel || 0))}>
                  {getAlarmStateText(convertAlarmLevelToState(alertLevel || 0))}
                </Tag>
              </dd>
            </div>
          </dl>
        </Col>
        <Col {...colProps}>
          <dl className='name-value-groups'>
            <div className='name-value'>
              <dt>最近连接时间</dt>
              <dd>
                {state && connectedAt > 0
                  ? moment(connectedAt * 1000).format('YYYY-MM-DD HH:mm:ss')
                  : '-'}
              </dd>
            </div>
          </dl>
        </Col>
        <Col {...colProps}>
          <dl className='name-value-groups'>
            <div className='name-value'>
              <dt>最近一次采集时间</dt>
              <dd>
                {data && data.timestamp > 0
                  ? moment.unix(data.timestamp).local().format('YYYY-MM-DD HH:mm:ss')
                  : '-'}
              </dd>
            </div>
          </dl>
        </Col>
      </Row>
    </ShadowCard>
  );
};
