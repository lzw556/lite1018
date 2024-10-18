import React from 'react';
import { AssetRow, HistoryData } from '../../../asset-common';
import { PointsLineChart } from '../detail/pointsLineChart';

export const RightConentInMonitorTab = ({
  asset,
  historyDatas
}: {
  asset: AssetRow;
  historyDatas: { name: string; data: HistoryData }[] | undefined;
}) => {
  return <PointsLineChart flange={asset} historyDatas={historyDatas} />;
};
