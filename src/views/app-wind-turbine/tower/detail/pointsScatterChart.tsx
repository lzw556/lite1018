import React from 'react';
import intl from 'react-intl-universal';
import { Language, useLocaleContext } from '../../../../localeProvider';
import { ChartContainer } from '../../../../components/charts/chartContainer';
import { roundValue } from '../../../../utils/format';
import { MonitoringPointTypeValue } from '../../../../config';
import { HistoryData } from '../../../asset-common';

type Data = {
  name: string;
  data: number[][];
  height?: number;
  radius?: number;
  typeLabel: string;
};

export const PointsScatterChart = ({
  data,
  style,
  type,
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
  type: MonitoringPointTypeValue;
  large?: boolean;
  dynamicData?: Data[];
  hideTitle?: boolean;
  hideSubTitle?: boolean;
}) => {
  const { language } = useLocaleContext();
  let circleChartOptions: any;
  const transformedData: Data[] = [];
  if (data.length > 0) {
    transformedData.push(...getDataOfCircleChart(data, type));
  } else if (dynamicData && dynamicData.length > 0) {
    transformedData.push(...dynamicData);
  }
  circleChartOptions = buildCirclePointsChartOfTower({
    datas: transformedData,
    titles: [
      intl.get('SCATTERGRAM'),
      `${intl.get(
        `FIELD_DISPLACEMENT_${
          type === MonitoringPointTypeValue.TOWER_BASE_SETTLEMENT ? 'AXIAL' : 'RADIAL'
        }`
      )}${intl.get('FIELD_DISPLACEMENT')}`,
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

function buildCirclePointsChartOfTower({
  datas,
  titles,
  large = false,
  lang = 'en-US',
  hideTitle = false,
  hideSubTitle = false
}: {
  datas: { name: string; data: number[][]; typeLabel: string; height?: number; radius?: number }[];
  titles: string[];
  large?: boolean;
  lang?: Language;
  hideTitle?: boolean;
  hideSubTitle?: boolean;
}) {
  const [title, displacement, direction] = titles;
  let max = undefined;
  const titleOptions: any = [];
  const series: any = [];
  datas.forEach(({ name, data, height, radius, typeLabel }) => {
    const displacements = data.map((item) => item[0]);
    const displacementMaxinum = Math.max(...displacements.filter((d) => !Number.isNaN(d)));
    const directionMaxinum = data.map((item) => item[1])[
      displacements.indexOf(displacementMaxinum)
    ];
    let subtext = '';
    if (displacementMaxinum && !hideSubTitle) {
      subtext += `${displacement} ${
        displacementMaxinum === Number.NEGATIVE_INFINITY ? '-' : `${displacementMaxinum}mm`
      }`;
    }
    if (!hideSubTitle) {
      subtext += `${large ? ' ' : '\r\n'}${direction} ${
        directionMaxinum ? `${directionMaxinum}°` : '-'
      }`;
    }
    const titleBaseOptions = {
      show: !hideTitle,
      text: typeLabel + title,
      textStyle: { color: '#8a8e99', fontWeight: 400, fontSize: 14 },
      subtext
    };
    const largeTitleOptions = {
      left: 'center',
      top: 30,
      subtextStyle: { align: 'left', lineHeight: 20 }
    };
    titleOptions.push(large ? { ...titleBaseOptions, ...largeTitleOptions } : titleBaseOptions);
    series.push({
      type: 'scatter',
      coordinateSystem: 'polar',
      data,
      name,
      symbolSize: 6
    });
    max = getMaxRadius(displacements, radius ? 10 : undefined);
  });
  return {
    title: titleOptions,
    legend: { show: false },
    tooltip: {
      formatter: ({
        seriesName,
        data: [displacementValue, directionValue]
      }: {
        seriesName: string;
        data: [number, number];
      }) => {
        return `${seriesName}<br/>${displacement} ${displacementValue}mm<br/>${direction} ${directionValue}°`;
      }
    },
    polar: { radius: 100, center: ['50%', '50%'] },
    angleAxis: {
      type: 'value',
      min: -180,
      max: 180,
      startAngle: 180,
      clockwise: false,
      boundaryGap: false,
      axisLine: { show: true, lineStyle: { type: 'dashed' } },
      axisTick: { show: true },
      axisLabel: {
        show: true,
        formatter: (value: number) => {
          switch (value) {
            case 0:
              return `${value} {direction|${lang === 'zh-CN' ? '东' : 'East'}}`;
            case 90:
              return ` {direction|${lang === 'zh-CN' ? '北' : 'North'}}\r\n${value}`;
            case -180:
              return `{direction|${lang === 'zh-CN' ? '西' : 'West'}} ${value}`;
            case -90:
              return `${value}\r\n{direction|${lang === 'zh-CN' ? '南' : 'South'}}`;
            default:
              return value;
          }
        },
        rich: {
          direction: {
            // color: '#1677ff',
            fontWeight: 'bold',
            lineHeight: 20
          }
        }
      },
      splitLine: { show: false }
    },
    radiusAxis: {
      type: 'value',
      splitNumber: 3,
      max,
      axisLabel: { hideOverlap: true }
    },
    series
  };
}

export function getDataOfCircleChart(
  datas: {
    name: string;
    history: HistoryData;
    typeLabel: string;
    height?: number;
    radius?: number;
  }[],
  type: MonitoringPointTypeValue
) {
  const ret: {
    name: string;
    typeLabel: string;
    data: number[][];
    height?: number;
    radius?: number;
  }[] = [];
  datas.forEach(({ name, history, typeLabel, height, radius }) => {
    if (history.length === 0) return [];
    const directions: number[] = [];
    const displacements: number[] = [];
    history.forEach(({ values }) => {
      values.forEach(({ data }) => {
        if (data['FIELD_DIRECTION'] != null) {
          directions.push(roundValue(data['FIELD_DIRECTION'], 2));
        }
        const key = `FIELD_DISPLACEMENT_${
          type === MonitoringPointTypeValue.TOWER_BASE_SETTLEMENT ? 'AXIAL' : 'RADIAL'
        }`;
        if (data[key] !== undefined) {
          displacements.push(roundValue(data[key], 2));
        }
      });
    });
    if (datas.length === 0 || displacements.length === 0 || directions.length === 0) {
      ret.push({ name, typeLabel, data: [], height, radius });
    } else {
      ret.push({
        name,
        typeLabel,
        data: displacements
          .map((data, index) => [data, directions[index]])
          .filter((d) => !Number.isNaN(d[0])),
        height,
        radius
      });
    }
  });
  return ret;
}

export function getMaxRadius(displacements: number[], heightOrRadius: number = 0) {
  const max = Math.max(...displacements);
  return max >= heightOrRadius && heightOrRadius >= 0 ? 1.5 * max : heightOrRadius;
}
