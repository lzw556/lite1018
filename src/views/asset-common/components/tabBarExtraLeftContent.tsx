import React from 'react';
import { Space, Tag } from 'antd';
import intl from 'react-intl-universal';
import {
  convertAlarmLevelToState,
  getAlarmLevelColor,
  getAlarmStateText
} from '../../../types/alarm';
import { AssetNavigator } from '.';

export const TabBarExtraLeftContent = ({
  id,
  label,
  alertLevel = 0
}: {
  id: number;
  label?: string;
  alertLevel?: number;
}) => {
  return (
    <Space style={{ marginRight: 30 }} size={30}>
      <AssetNavigator id={id} />
      <Space>
        {label ? intl.get(label) : ''}
        <Tag color={getAlarmLevelColor(convertAlarmLevelToState(alertLevel || 0))}>
          {intl.get(getAlarmStateText(convertAlarmLevelToState(alertLevel || 0)))}
        </Tag>
      </Space>
    </Space>
  );
};
