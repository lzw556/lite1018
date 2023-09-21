import React from 'react';
import intl from 'react-intl-universal';
import { ChartContainer } from '../../components/charts/chartContainer';
import { HistoryData } from '../monitoring-point';
import { buildCirclePointsChartOfTower, getDataOfCircleChart } from './circlePointChartHelper';
import { useLocaleContext } from '../../localeProvider';

type Data = {
  name: string;
  data: number[][];
  height?: number;
  radius?: number;
  typeLabel: string;
};

export const CircleChart = ({
  data,
  style,
  large = false,
  dynamicData = [],
  hideTitle,
  hideSubTitle
}: {
  data: {
    name: string;
    history: HistoryData;
    height?: number;
    radius?: number;
    typeLabel: string;
  }[];
  style?: React.CSSProperties;
  large?: boolean;
  dynamicData?: Data[];
  hideTitle?: boolean;
  hideSubTitle?: boolean;
}) => {
  const { language } = useLocaleContext();
  let circleChartOptions: any;
  const transformedData: Data[] = [];
  if (data.length > 0) {
    transformedData.push(...getDataOfCircleChart(data));
  } else if (dynamicData && dynamicData.length > 0) {
    transformedData.push(...dynamicData);
  }
  circleChartOptions = buildCirclePointsChartOfTower({
    datas: transformedData,
    titles: [
      intl.get('SCATTERGRAM'),
      `${intl.get('FIELD_DISPLACEMENT_RADIAL')}${intl.get('FIELD_DISPLACEMENT')}`,
      intl.get('FIELD_DIRECTION')
    ],
    lang: language,
    large,
    hideTitle,
    hideSubTitle
  });

  return circleChartOptions ? (
    <ChartContainer title='' options={circleChartOptions} style={style} />
  ) : null;
};
