import { Col, Row } from 'antd';
import moment from 'moment';
import * as React from 'react';
import ShadowCard from '../../../../components/shadowCard';
import { Device } from '../../../../types/device';
import { DeviceType } from '../../../../types/device_type';
import { SingleDeviceStatus } from '../../../device/SingleDeviceStatus';
import { generateColProps } from '../../utils';
import '../../../../string-extension';

export const SingleDeviceInfo: React.FC<Device> = (props) => {
  const colProps = generateColProps({ xxl: 8, xl: 8, lg: 12, md: 12 });
  const { name, typeId, information, alertStates, state, macAddress, data } = props;
  const { batteryVoltage, signalLevel, connectedAt } = state;
  return (
    <ShadowCard>
      <Row>
        <Col {...colProps}>
          <dl className='name-value-groups'>
            <div className='name-value'>
              <dt>设备名称</dt>
              <dd>{name}</dd>
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
              <dt>状态</dt>
              <dd>
                <SingleDeviceStatus alertStates={alertStates} state={state} />
              </dd>
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
              <dt>最近连接时间</dt>
              <dd>
                {state && connectedAt
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
                {data && data.timestamp
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
