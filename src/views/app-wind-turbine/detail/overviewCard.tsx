import React from 'react';
import intl from 'react-intl-universal';
import { NameValueGroups } from '../../../components/name-values';
import { oneWeekNumberRange } from '../../../components/rangeDatePicker';
import {
  ASSET_PATHNAME,
  AssetRow,
  Asset,
  Introduction,
  INVALID_MONITORING_POINT,
  Points
} from '../../asset-common';
import * as Flange from '../flange';
import * as Tower from '../tower';
import { useHistoryDatas } from '../utils';
import { flange } from '../constants';
import { Icon } from '../icon';

export const OverviewCard = ({ asset }: { asset: AssetRow }) => {
  const { id, name, statistics: flangeStatistics, type } = asset;
  const realPoints = Points.filter(asset.monitoringPoints);
  const historyData = useHistoryDatas(asset, oneWeekNumberRange);

  const { alarmState, statistics } = Asset.resolveStatistics(
    flangeStatistics,
    ['monitoringPointNum', intl.get('MONITORING_POINT')],
    ['anomalous', intl.get(INVALID_MONITORING_POINT)],
    ['deviceNum', intl.get('DEVICE')],
    ['offlineDeviceNum', intl.get('OFFLINE_DEVICE')]
  );
  const style = { left: '-24px', top: '-20px', height: 450 };
  return (
    <Introduction
      {...{
        className: 'shadow',
        title: {
          name: name,
          path: `/${ASSET_PATHNAME}/${id}-${type}`,
          state: [`${id}-${type}`]
        },
        alarmState,
        icon: { svg: <Icon asset={asset} height={30} width={30} />, small: true, focus: true },
        count: <NameValueGroups col={{ span: 12 }} divider={20} items={statistics} />,
        chart:
          type === flange.type ? (
            <Flange.PointsScatterChart asset={asset} style={style} />
          ) : (
            <Tower.PointsScatterChart
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
              style={style}
              type={realPoints?.[0]?.type}
            />
          ),
        horizontal: true
      }}
    />
  );
};
