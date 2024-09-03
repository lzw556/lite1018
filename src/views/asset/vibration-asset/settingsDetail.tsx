import React from 'react';
import intl from 'react-intl-universal';

export const SettingsDetail = ({ settings }: { settings: any }) => {
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 10 }}>
      <li style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
        <span style={{ color: '#8a8e99' }}>{intl.get(`motor.motor_type`)}</span>
        <span>{settings['motor_type']}</span>
      </li>
      <li style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
        <span style={{ color: '#8a8e99' }}>{intl.get(`motor.rotation_speed`)}</span>
        <span>{settings['rotation_speed']}RPM</span>
      </li>
      <li style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
        <span style={{ color: '#8a8e99' }}>{intl.get(`motor.variable_frequency_drive`)}</span>
        <span>{settings['variable_frequency_drive'] ? '是' : '否'}</span>
      </li>
      <li style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
        <span style={{ color: '#8a8e99' }}>{intl.get(`motor.nominal_power`)}</span>
        <span>{settings['nominal_power']}kW</span>
      </li>
      <li style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
        <span style={{ color: '#8a8e99' }}>{intl.get(`motor.mounting`)}</span>
        <span>{settings['mounting'] === 1 ? '水平' : '垂直'}</span>
      </li>
      <li style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
        <span style={{ color: '#8a8e99' }}>{intl.get(`motor.bearing_type`)}</span>
        <span>{settings['bearing_type'] === 1 ? '滚动轴承' : '滑动轴承'}</span>
      </li>
      <li style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
        <span style={{ color: '#8a8e99' }}>{intl.get(`motor.bearing_model`)}</span>
        <span>{settings['bearing_model']}</span>
      </li>
    </ul>
  );
};
