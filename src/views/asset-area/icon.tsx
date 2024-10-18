import React from 'react';
import AntIcon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import { convertAlarmLevelToState } from '../../types/alarm';
import { AssetRow } from '../asset-common';
import { ReactComponent as SVG } from './general.svg';

export const Icon = (props: Partial<CustomIconComponentProps> & { asset: AssetRow }) => {
  const { asset, ...rest } = props;
  const alarmState = convertAlarmLevelToState(asset.alertLevel);
  const className = `alarm-${alarmState}-fill`;
  const commonProps = { ...rest, className };
  return <AntIcon component={() => <SVG {...commonProps} />} />;
};
