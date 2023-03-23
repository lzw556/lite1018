import React from 'react';
import { useLocation } from 'react-router-dom';
import { NameValueGroups } from '../../components/name-values';
import { INVALID_MONITORING_POINT } from '../monitoring-point';
import { getAssetStatistics } from '../asset/common/statisticsHelper';
import { Introduction } from '../asset/components/introduction';
import { AssetRow } from '../asset/types';
import { CircleChart } from './circleChart';
import { FlangeIcon } from './icon';
import { FLANGE_PATHNAME } from './types';
import intl from 'react-intl-universal';

export const FlangeCard = (flange: AssetRow) => {
  const { id, name, statistics: flangeStatistics } = flange;
  const { state } = useLocation();

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
          path: `/${FLANGE_PATHNAME}/${id}`,
          state
        },
        alarmState,
        icon: { svg: <FlangeIcon />, small: true, focus: true },
        count: <NameValueGroups horizontal={true} items={statistics} />,
        chart: <CircleChart asset={flange} style={{ left: '-24px', top: '-20px', height: 450 }} />,
        horizontal: true
      }}
    />
  );
};
