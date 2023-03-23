import { Tag } from 'antd';
import * as React from 'react';
import {
  ColorDanger,
  ColorHealth,
  ColorInfo,
  ColorOffline,
  ColorWarn
} from '../../constants/color';
import { Device } from '../../types/device';
import intl from 'react-intl-universal';

export const SingleDeviceStatus: React.FC<Pick<Device, 'alertStates' | 'state'>> = ({
  alertStates,
  state: { isOnline }
}) => {
  if (isOnline) {
    if (alertStates && alertStates.length > 0) {
      let maxLevel = alertStates[0].rule.level;
      alertStates.forEach((state, index) => {
        if (index > 0 && state.rule.level > maxLevel) maxLevel = state.rule.level;
      });
      switch (maxLevel) {
        case 1:
          return <Tag color={ColorInfo}>{intl.get('ALARM_LEVEL_MINOR')}</Tag>;
        case 2:
          return <Tag color={ColorWarn}>{intl.get('ALARM_LEVEL_MAJOR')}</Tag>;
        case 3:
          return <Tag color={ColorDanger}>{intl.get('ALARM_LEVEL_CRITICAL')}</Tag>;
        default:
          return null;
      }
    } else {
      return <Tag color={ColorHealth}>{intl.get('ALARM_LEVEL_NORMAL')}</Tag>;
    }
  } else {
    return (
      <Tag color={ColorOffline} style={{ color: '#000' }}>
        {intl.get('OFFLINE')}
      </Tag>
    );
  }
};
