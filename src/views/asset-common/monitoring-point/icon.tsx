import React from 'react';
import AntIcon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import { ReactComponent as SVG } from './monitoring_point.svg';
import { convertAlarmLevelToState } from '../../../types/alarm';
import { MonitoringPointRow } from './types';

export const Icon = (
  props: Partial<CustomIconComponentProps> & { monitoringPoint: MonitoringPointRow }
) => {
  const { monitoringPoint, ...rest } = props;
  const alarmState = convertAlarmLevelToState(monitoringPoint.alertLevel || 0);
  const className = `alarm-${alarmState}-fill`;
  return <AntIcon component={() => <SVG {...{ ...rest, className }} />} />;
};
