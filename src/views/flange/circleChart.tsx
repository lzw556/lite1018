import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChartContainer } from '../../components/charts/chartContainer';
import { getRealPoints, MONITORING_POINT_PATHNAME } from '../monitoring-point';
import { AssetRow } from '../asset/types';
import { buildCirclePointsChartOfFlange } from './circlePointChartHelper';

export const CircleChart = ({
  asset,
  title,
  big,
  style
}: {
  asset: AssetRow;
  title?: string;
  big?: boolean;
  style?: React.CSSProperties;
}) => {
  const { monitoringPoints, attributes } = asset;
  const navigate = useNavigate();
  let chart: any = null;
  const points = getRealPoints(monitoringPoints);
  if (points.length > 0) {
    chart = {
      title,
      options: buildCirclePointsChartOfFlange(points, attributes, big),
      style,
      clickHandler: (paras: any) => {
        const index = paras.value[1];
        if (points.length > index) {
          navigate(`/${MONITORING_POINT_PATHNAME}/${points[index].id}-${points[index].type}`, {
            state: [`${points[index].id}-${points[index].type}`]
          });
        }
      }
    };
  }

  return <ChartContainer {...chart} />;
};
