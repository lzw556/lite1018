import React from 'react';
import { NameValueGroups } from '../../components/name-values';
import { INVALID_MONITORING_POINT, getRealPoints } from '../monitoring-point';
import { getAssetStatistics } from '../asset/common/statisticsHelper';
import { Introduction } from '../asset/components/introduction';
import { ASSET_PATHNAME, AssetRow } from '../asset/types';
import { TowerIcon } from './icon';
import intl from 'react-intl-universal';
import { CircleChart } from './circleChart';
import { useHistoryDatas } from './show';
import { oneWeekNumberRange } from '../../components/rangeDatePicker';

export const TowerCard = (tower: AssetRow) => {
  const { id, name, statistics: towerStatistics, type } = tower;
  const realPoints = getRealPoints(tower.monitoringPoints);
  const historyData = useHistoryDatas(tower, oneWeekNumberRange);

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
          path: `/${ASSET_PATHNAME}/${id}-${type}`,
          state: [`${id}-${type}`]
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
            type={realPoints?.[0].type}
          />
        ),
        horizontal: true
      }}
    />
  );
};
