import React from 'react';
import { useLocation } from 'react-router-dom';
import { NameValueGroups } from '../../components/name-values';
import { INVALID_MONITORING_POINT } from '../monitoring-point';
import { getAssetStatistics } from '../asset/common/statisticsHelper';
import { Introduction } from '../asset/components/introduction';
import { AssetRow } from '../asset/types';
import { TowerIcon } from './icon';
import intl from 'react-intl-universal';
import { TOWER_PATHNAME } from '.';
import { CircleChart } from './circleChart';
import { useHistoryDatas } from './show';
import { oneWeekNumberRange } from '../../components/rangeDatePicker';

export const TowerCard = (tower: AssetRow) => {
  const { id, name, statistics: towerStatistics } = tower;
  const historyData = useHistoryDatas(tower, oneWeekNumberRange);
  const { state } = useLocation();

  const { alarmState, statistics } = getAssetStatistics(
    towerStatistics,
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
          path: `/${TOWER_PATHNAME}/${id}`,
          state
        },
        alarmState,
        icon: { svg: <TowerIcon />, small: true, focus: true },
        count: <NameValueGroups col={{ span: 12 }} divider={20} items={statistics} />,
        chart: (
          <CircleChart
            data={
              historyData?.map((h) => {
                return {
                  name: h.name,
                  history: h.data,
                  typeLabel: '',
                  height: h.height,
                  radius: h.radius
                };
              }) ?? []
            }
            hideTitle={true}
            style={{ left: '-24px', top: '-20px', height: 450 }}
          />
        ),
        horizontal: true
      }}
    />
  );
};
