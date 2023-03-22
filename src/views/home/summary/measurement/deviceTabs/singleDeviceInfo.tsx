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
import intl from 'react-intl-universal';

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
              <dt>{intl.get('DEVICE_NAME')}</dt>
              <dd>
                <Link to={`/device-management?locale=devices/deviceDetail&id=${id}`}>{name}</Link>
              </dd>
            </div>
          </dl>
        </Col>
        <Col {...colProps}>
          <dl className='name-value-groups'>
            <div className='name-value'>
              <dt>{intl.get('TYPE')}</dt>
              <dd>{intl.get(DeviceType.toString(typeId))}</dd>
            </div>
          </dl>
        </Col>
        <Col {...colProps}>
          <dl className='name-value-groups'>
            <div className='name-value'>
              <dt>{intl.get('MODEL')}</dt>
              <dd>{information && information.model ? information.model : '-'}</dd>
            </div>
          </dl>
        </Col>
        <Col {...colProps}>
          <dl className='name-value-groups'>
            <div className='name-value'>
              <dt>{intl.get('MAC_ADDRESS')}</dt>
              <dd>{macAddress.toUpperCase().macSeparator()}</dd>
            </div>
          </dl>
        </Col>
        <Col {...colProps}>
          <dl className='name-value-groups'>
            <div className='name-value'>
              <dt>{intl.get('BATTERY_VOLTAGE')}(mV)</dt>
              <dd>{state && typeId !== DeviceType.Gateway ? batteryVoltage : '-'}</dd>
            </div>
          </dl>
        </Col>
        <Col {...colProps}>
          <dl className='name-value-groups'>
            <div className='name-value'>
              <dt>{intl.get('SIGNAL_STRENGTH')}(dB)</dt>
              <dd>{state && typeId !== DeviceType.Gateway ? signalLevel : '-'}</dd>
            </div>
          </dl>
        </Col>
        <Col {...colProps}>
          <dl className='name-value-groups'>
            <div className='name-value'>
              <dt>{intl.get('STATUS')}</dt>
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
              <dt>{intl.get('LAST_CONNECTED_TIME')}</dt>
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
              <dt>{intl.get('LAST_SAMPLE_TIME')}</dt>
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
