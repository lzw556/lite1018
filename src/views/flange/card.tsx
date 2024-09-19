import React from 'react';
import { NameValueGroups } from '../../components/name-values';
import { INVALID_MONITORING_POINT } from '../monitoring-point';
import { getAssetStatistics } from '../asset/common/statisticsHelper';
import { Introduction } from '../asset/components/introduction';
import { ASSET_PATHNAME, AssetRow } from '../asset/types';
import { CircleChart } from './circleChart';
import { FlangeIcon } from './icon';
import intl from 'react-intl-universal';

export const FlangeCard = (flange: AssetRow) => {
  const { id, name, statistics: flangeStatistics, type } = flange;

  const { alarmState, statistics } = getAssetStatistics(
    flangeStatistics,
    ['monitoringPointNum', intl.get('MONITORING_POINT')],
    ['anomalous', intl.get(INVALID_MONITORING_POINT)],
    ['deviceNum', intl.get('DEVICE')],
    ['offlineDeviceNum', intl.get('OFFLINE_DEVICE')]
  );
  return (
    <Introduction
      {...{
        title: {
          name: name,
          path: `/${ASSET_PATHNAME}/${id}-${type}`,
          state: [`${id}-${type}`]
        },
        alarmState,
        icon: { svg: <FlangeIcon />, small: true, focus: true },
        count: <NameValueGroups col={{ span: 12 }} divider={20} items={statistics} />,
        chart: <CircleChart asset={flange} style={{ left: '-24px', top: '-20px', height: 450 }} />,
        horizontal: true
      }}
    />
  );
};
