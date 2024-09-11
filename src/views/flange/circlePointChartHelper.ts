import { ColorDanger, ColorHealth, ColorInfo, ColorWarn } from '../../constants/color';
import { isMobile } from '../../utils/deviceDetection';
import { getValue, roundValue } from '../../utils/format';
import {
  MonitoringPointRow,
  MonitoringPointTypeValue,
  getDisplayProperties,
  sortMonitoringPointByAttributes
} from '../monitoring-point';
import { AssetRow } from '../asset/types';
import {
  convertAlarmLevelToState,
  getAlarmLevelColor,
  getAlarmStateText
} from '../asset/common/statisticsHelper';
import intl from 'react-intl-universal';

export function buildCirclePointsChartOfFlange(
  measurements: MonitoringPointRow[],
  attributes?: AssetRow['attributes'],
  isBig: boolean = false
) {
  const count = measurements.length;
  if (!count) return null;
  let radar: any = [];
  const polar: { radius: number }[] = [];
  const angleAxis: any = [];
  const radiusAxis: any = [];
  const series: any = [];
  const sortedMeasurements = sortMonitoringPointByAttributes(measurements);
  const outer = generateOuter(sortedMeasurements, isBig);
  polar.push(outer.radius);
  angleAxis.push(outer.angleAxis);
  radiusAxis.push(outer.radiusAxis);
  series.push(outer.series);

  const actuals = generateActuals(sortedMeasurements, isBig);
  polar.push(actuals.radius);
  angleAxis.push(actuals.angleAxis);
  let max = getMax(actuals.max, attributes, measurements[0].type);
  let min = actuals.min || -1;
  if (measurements[0].type === MonitoringPointTypeValue.LOOSENING_ANGLE) {
    if (max < 5) {
      max = 10;
    }
    min = -(max * 2);
  }
  radiusAxis.push({ ...actuals.radiusAxis, max, min });
  series.push(actuals.series);

  const legends = [];
  const unit = getDisplayProperties(measurements[0].properties, measurements[0].type).filter(
    (p) => p.first
  )?.[0]?.unit;
  if (
    measurements[0].type === MonitoringPointTypeValue.PRELOAD &&
    checkValidAttr(attributes, 'normal', min)
  ) {
    const seriesName = `${intl.get('RATING')} ${attributes?.normal?.value}${unit}`;
    const normal = getSeries(ColorHealth, attributes?.normal?.value, seriesName);
    legends.push({ name: seriesName, itemStyle: { color: ColorHealth } });
    series.push(normal.series);
  }

  if (
    measurements[0].type === MonitoringPointTypeValue.LOOSENING_ANGLE &&
    checkValidAttr(attributes, 'initial', min)
  ) {
    const seriesName = `${intl.get('INITIAL_VALUE')} ${attributes?.initial?.value}${unit}`;
    const initial = getSeries(ColorHealth, attributes?.initial?.value, seriesName);
    legends.push({ name: seriesName, itemStyle: { color: ColorHealth } });
    series.push(initial.series);
  }

  if (checkValidAttr(attributes, 'info', min)) {
    const seriesName = `${intl.get('ALARM_LEVEL_MINOR_TITLE')} ${attributes?.info?.value}${unit}`;
    const info = getSeries(ColorInfo, attributes?.info?.value, seriesName);
    legends.push({ name: seriesName, itemStyle: { color: ColorInfo } });
    series.push(info.series);
  }

  if (checkValidAttr(attributes, 'warn', min)) {
    const seriesName = `${intl.get('ALARM_LEVEL_MAJOR_TITLE')} ${attributes?.warn?.value}${unit}`;
    const warn = getSeries(ColorWarn, attributes?.warn?.value, seriesName);
    legends.push({ name: seriesName, itemStyle: { color: ColorWarn } });
    series.push(warn.series);
  }

  if (checkValidAttr(attributes, 'danger', min)) {
    const seriesName = `${intl.get('ALARM_LEVEL_CRITICAL_TITLE')} ${
      attributes?.danger?.value
    }${unit}`;
    const danger = getSeries(ColorDanger, attributes?.danger?.value, seriesName);
    legends.push({ name: seriesName, itemStyle: { color: ColorDanger } });
    series.push(danger.series);
  }

  return {
    radar,
    polar,
    angleAxis,
    radiusAxis,
    legend: {
      data: legends,
      bottom: isMobile ? 50 : 0
    },
    series
  };
}

function checkValidAttr(
  attributes: AssetRow['attributes'],
  key: keyof Pick<
    Required<Required<AssetRow>['attributes']>,
    'normal' | 'initial' | 'info' | 'warn' | 'danger'
  >,
  reference: number,
  abs?: boolean
) {
  if (attributes) {
    const item = attributes[key];
    if (item) {
      if (abs) {
        return item.enabled && item.value !== '' && Math.abs(item.value as number) > reference;
      }
      return item.enabled && item.value !== '' && (item.value as number) > reference;
    }
    return false;
  }
  return false;
}

function getMax(max: number, attributes: AssetRow['attributes'], type: number) {
  let final = max;
  if (
    type === MonitoringPointTypeValue.PRELOAD &&
    checkValidAttr(attributes, 'normal', final, true)
  ) {
    final = Math.abs(attributes?.normal?.value as number);
  }
  if (
    type === MonitoringPointTypeValue.LOOSENING_ANGLE &&
    checkValidAttr(attributes, 'initial', final, true)
  ) {
    final = Math.abs(attributes?.initial?.value as number);
  }
  if (checkValidAttr(attributes, 'info', final, true)) {
    final = Math.abs(attributes?.info?.value as number);
  }
  if (checkValidAttr(attributes, 'warn', final, true)) {
    final = Math.abs(attributes?.warn?.value as number);
  }
  if (checkValidAttr(attributes, 'danger', final, true)) {
    final = Math.abs(attributes?.danger?.value as number);
  }
  return final;
}

function generateOuter(measurements: MonitoringPointRow[], isBig: boolean = false) {
  let radius: any = { radius: isBig ? 180 : 150 };
  if (isMobile) {
    radius = { radius: isBig ? '90%' : '85%' };
  }
  const angleAxis = {
    type: 'category',
    startAngle: 0,
    clockwise: false,
    boundaryGap: false,
    axisLine: { show: true, lineStyle: { type: 'dashed' } },
    axisTick: { show: false },
    axisLabel: { show: false },
    splitLine: { show: false },
    data: Object.keys(measurements)
  };
  const radiusAxis = {
    type: 'value',
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { show: false },
    splitLine: { show: false }
  };
  const seriesData = measurements.map(({ name, attributes, data, alertLevel }, index) => {
    let field = getDisplayProperties(measurements[0].properties, measurements[0].type).filter(
      (p) => p.first
    )?.[0];
    let value = NaN;
    if (field && data) {
      value = roundValue(data.values[field.key] as number, field.precision);
    }
    return {
      name,
      value: [1, index, `${name}`],
      label: {
        show: true,
        color: '#fff',
        formatter: (paras: any) => attributes?.index
      },
      tooltip: {
        formatter: `${
          alertLevel && alertLevel > 0
            ? `${getAlarmStateText(convertAlarmLevelToState(alertLevel))}报警<br/>`
            : ''
        }${generateRowOfTooltip('', name, getValue(value, field?.unit))}`
      },
      itemStyle: {
        opacity: 1,
        color: getAlarmLevelColor(convertAlarmLevelToState(alertLevel || 0))
      }
    };
  });
  const series = {
    type: 'scatter',
    name: 'outer',
    coordinateSystem: 'polar',
    polarIndex: 0,
    symbol:
      'path://M675.9 107.2H348.1c-42.9 0-82.5 22.9-104 60.1L80 452.1c-21.4 37.1-21.4 82.7 0 119.8l164.1 284.8c21.4 37.2 61.1 60.1 104 60.1h327.8c42.9 0 82.5-22.9 104-60.1L944 571.9c21.4-37.1 21.4-82.7 0-119.8L779.9 167.3c-21.4-37.1-61.1-60.1-104-60.1z',
    symbolSize: 30,
    data: seriesData,
    zlevel: 10
  };
  return { radius, angleAxis, radiusAxis, series };
}

function generateActuals(measurements: MonitoringPointRow[], isBig: boolean = false) {
  let radius: any = { radius: isBig ? 150 : 120 };
  if (isMobile) {
    radius = { radius: isBig ? '85%' : '80%' };
  }
  const seriesData: any = [];
  let field = getDisplayProperties(measurements[0].properties, measurements[0].type).filter(
    (p) => p.first
  )?.[0];
  let max = 0;
  let min = 0;
  measurements.forEach(({ data, name }, index) => {
    let value = NaN;
    if (field && data) {
      value = roundValue(data.values[field.key] as number, field.precision);
      if (value) {
        if (Math.abs(value) > max) max = Math.abs(value);
        if (value < min) min = value;
      }
    }
    if (!Number.isNaN(value)) seriesData.push([value, (index * 360) / measurements.length]);
  });
  const angleAxis = {
    polarIndex: 1,
    type: 'value',
    startAngle: 0,
    clockwise: false,
    boundaryGap: false,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { show: false },
    splitLine: { show: false },
    min: 0,
    max: 360
  };
  const radiusAxis = {
    polarIndex: 1,
    type: 'value',
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { show: false },
    splitLine: { show: false },
    max,
    min: max / 2
  };
  const series = {
    type: 'line',
    name: intl.get('ACTUAL_VALUE'),
    data: [...seriesData, seriesData[0]],
    itemStyle: { color: 'rgb(0,130,252)' },
    tooltip: { show: false },
    zlevel: 15,
    coordinateSystem: 'polar',
    polarIndex: 1,
    smooth: false
  };
  return { series, max, radius, angleAxis, radiusAxis, min };
}

function getSeries(color: string, value: number | string | undefined, name: string) {
  const data = [];
  for (let index = 0; index < 360; index++) {
    data.push([value, index]);
  }
  const series = {
    type: 'line',
    coordinateSystem: 'polar',
    polarIndex: 1,
    data,
    symbol: 'none',
    symbolSize: 0.01,
    name,
    lineStyle: { type: 'dashed', color, opacity: 0.6 }
    // label: {show: true, formatter:(para:any)=>{
    //   if(para.dataIndex === 0) return para.value[0];
    //   return ''
    // }}
  };
  return { series };
}

function generateRowOfTooltip(marker: string, seriesName: string, text: string) {
  return `<div style='display:flex;justify-content:space-between;'><span style='flex:0 0 auto'>${marker} ${seriesName}</span><strong style='flex:0 0 auto; text-align:right;text-indent:1em;'>${text}</strong></div>`;
}
