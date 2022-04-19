import { Tag } from 'antd';
import * as React from 'react';
import { ColorDanger, ColorHealth, ColorInfo, ColorOffline, ColorWarn } from '../../constants/color';
import { Device } from '../../types/device';

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
          return <Tag color={ColorInfo}>次要</Tag>;
        case 2:
          return <Tag color={ColorWarn}>重要</Tag>;
        case 3:
          return <Tag color={ColorDanger}>紧急</Tag>;
        default:
          return null;
      }
    } else {
      return <Tag color={ColorHealth}>正常</Tag>;
    }
  } else {
    return <Tag color={ColorOffline} style={{color:'#000'}}>离线</Tag>;
  }
};
