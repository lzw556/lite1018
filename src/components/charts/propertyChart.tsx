import React from 'react';
import { CSSProperties } from 'react';
import * as echarts from 'echarts';
import EChartsReact, { EChartsInstance } from 'echarts-for-react';
import _ from 'lodash';
import * as Mathjs from 'mathjs';
import intl from 'react-intl-universal';
import { HistoryData } from '../../views/monitoring-point';
import { DisplayProperty } from '../../constants/properties';
import dayjs from '../../utils/dayjsUtils';
import { ChartStyle } from '../../constants/chart';
import { getValue, roundValue } from '../../utils/format';

export interface Series {
  data: { [name: string]: number[] };
  main?: boolean;
  raw?: any;
  xAxisValues: string[];
}

export const PropertyChart = React.forwardRef(function PropertyChart(
  {
    dataZoom = false,
    dispatchActionOption,
    loading,
    onlyShowLastAxisInLegendByDefault = false,
    rawOptions,
    series,
    style,
    withArea = false,
    xAxisLabelLimit = false,
    xAxisUnit,
    xAxisValues,
    yAxisMinInterval,
    yAxisValueMeta
  }: {
    dataZoom?: boolean | NonNullable<object>;
    dispatchActionOption?: any;
    loading?: boolean;
    onlyShowLastAxisInLegendByDefault?: boolean;
    rawOptions?: any;
    series: Series[];
    style?: CSSProperties;
    withArea?: boolean;
    xAxisLabelLimit?: boolean;
    xAxisUnit?: string;
    xAxisValues?: string[];
    yAxisMinInterval?: number;
    yAxisValueMeta: { unit?: string; precision: number; showName?: boolean };
  },
  ref: React.ForwardedRef<EChartsInstance>
) {
  const buildOptions = () => {
    let grid = ChartStyle.Grid;
    const dz = buildDataZoom();
    if (dz !== null) {
      grid = { ...grid, bottom: '13%' };
    }
    if (xAxisUnit) {
      grid = { ...grid, right: '40' };
    }
    if (series.length === 0) return null;
    let mainXAxisValues = series[0].xAxisValues;
    if (series.filter((s) => s.main).length > 0) {
      mainXAxisValues = series.filter((s) => s.main)[0].xAxisValues;
    }
    if (xAxisValues) {
      mainXAxisValues = xAxisValues;
    }
    return {
      color: ChartStyle.Colors,
      dataset: buildDataSet(),
      dataZoom: dz,
      grid,
      legend: getSelectedLegends(),
      ...rawOptions,
      series: buildSeries(),
      tooltip: buildTooltip(),
      xAxis: {
        data: mainXAxisValues,
        type: 'category',
        boundaryGap: false,
        axisLabel: {
          align: 'left',
          hideOverlap: true,
          showMaxLabel: xAxisLabelLimit,
          formatter: (val: string, index: number) => {
            if (xAxisLabelLimit) {
              if (index === 0) {
                return val;
              } else if (index === mainXAxisValues.length - 1) {
                return `{end| ${val}}`;
              } else {
                return '';
              }
            } else {
              return val;
            }
          },
          rich: {
            end: {
              align: 'left',
              padding: [0, 0, 0, -130]
            }
          }
        },
        name: xAxisUnit
      },
      yAxis: {
        type: 'value',
        ...ChartStyle.DashedSplitLine,
        min: (values: { min: number; max: number }) => {
          if (!Number.isNaN(values.min) && !Number.isNaN(values.max)) {
            const max = _.round(values.max, yAxisValueMeta.precision);
            const min = _.round(values.min, yAxisValueMeta.precision);
            const option = buildYAxisOption(max, min);
            intervalOfYAxisRef.current = option?.interval;
            return option?.min;
          }
        },
        max: (values: { min: number; max: number }) => {
          if (!Number.isNaN(values.min) && !Number.isNaN(values.max)) {
            const max = _.round(values.max, yAxisValueMeta.precision);
            const min = _.round(values.min, yAxisValueMeta.precision);
            const option = buildYAxisOption(max, min);
            return option?.max;
          }
        },
        name: yAxisValueMeta.showName && yAxisValueMeta.unit
      }
    };
  };

  const buildDataSet = () => {
    return series.map((s) => {
      return { source: { x: s.xAxisValues, ...s.data } };
    });
  };

  const buildDataZoom = () => {
    let dz = null;
    if (typeof dataZoom === 'object') {
      dz = dataZoom;
    } else if (dataZoom === true) {
      dz = [
        {
          type: 'slider',
          start: 70,
          end: 100
        }
      ];
    }
    return dz;
  };

  const getSelectedLegends = () => {
    if (series.length > 1 && onlyShowLastAxisInLegendByDefault === true) {
      const selected = series.map((s, i) => {
        const seriesName = Object.keys(s.data)[0];
        return [seriesName, i === series.length - 1];
      });
      return { selected: _.fromPairs(selected) };
    } else if (series.length > 3) {
      return { bottom: 0, type: 'scroll' };
    } else {
      return {};
    }
  };

  const buildSeries = () => {
    return series.map((s, i) => {
      const options = {
        ...ChartStyle.LineSeries,
        datasetIndex: i,
        emphasis: { focus: 'series' },
        ...s.raw
      };
      return withArea ? { ...options, ...setAreaStyle(ChartStyle.Colors[i]) } : options;
    });
  };

  const buildTooltip = () => {
    const { precision, unit } = yAxisValueMeta;
    return {
      trigger: 'axis',
      valueFormatter: (v: number) => getValue(roundValue(v, precision), unit),
      confine: true
    };
  };

  const buildYAxisOption = (max: number, min: number) => {
    const SPLIT_NUMBER = 6;
    if (!yAxisMinInterval) return null;
    const precision = pickPrecisionFromInterval(yAxisMinInterval);
    const newMax = getFitedValue(max, yAxisMinInterval, precision, _.ceil);
    const newMin = getFitedValue(min, yAxisMinInterval, precision, _.floor);
    const fitAllInterval = add(newMin, multiply(SPLIT_NUMBER, yAxisMinInterval)) > newMax;
    let interval = yAxisMinInterval;
    if (!fitAllInterval) {
      interval = _.ceil((newMax - newMin) / SPLIT_NUMBER, precision);
    }
    return {
      interval,
      max: newMax,
      min: sub(newMax, multiply(SPLIT_NUMBER, interval))
    };
  };

  const options = buildOptions();
  const chartInstanceRef = React.useRef<any>();
  const intervalOfYAxisRef = React.useRef<number | undefined>();
  console.log('opsops', options);
  const adjustIntervalOfYAxis = () => {
    if (intervalOfYAxisRef.current) {
      chartInstanceRef.current?.getEchartsInstance().setOption({
        yAxis: { interval: intervalOfYAxisRef.current }
      });
    }
  };

  React.useEffect(() => {
    adjustIntervalOfYAxis();
    if (dispatchActionOption) {
      chartInstanceRef.current?.getEchartsInstance().dispatchAction(dispatchActionOption);
    }
  }, [series, dispatchActionOption]);

  return (
    options && (
      <EChartsReact
        notMerge={true}
        ref={(_ref) => {
          chartInstanceRef.current = _ref;
          if (ref && typeof ref !== 'function') {
            ref.current = _ref;
          }
        }}
        style={style}
        showLoading={loading}
        option={options}
        onEvents={{ dataZoom: () => adjustIntervalOfYAxis() }}
      />
    )
  );
});

function setAreaStyle(color: string) {
  const areaStyle = {
    opacity: 0.6,
    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      {
        offset: 0,
        color: color
      },
      {
        offset: 1,
        color: '#fff'
      }
    ])
  };
  const itemStyle = {
    normal: {
      color: color
    }
  };
  return { areaStyle, itemStyle };
}

export function transformHistoryData(
  origin: HistoryData,
  property: DisplayProperty,
  naming?: { replace?: string; prefix?: string }
) {
  if (origin.length === 0) return null;
  const xAxisValues = origin.map(({ timestamp }) =>
    dayjs.unix(timestamp).local().format('YYYY-MM-DD HH:mm:ss')
  );
  const series =
    property.fields?.map((f) => {
      let seriesName = intl.get(f.name);
      if (naming) {
        const { replace, prefix } = naming;
        if (replace) {
          seriesName = replace;
        } else if (prefix) {
          seriesName = `${prefix}${seriesName}`;
        }
      }
      return {
        [seriesName]: origin.map(({ values }) => {
          const value = values.find((v) =>
            property.parentKey ? v.key === property.parentKey : v.key === property.key
          );
          return value?.data?.[f.name] ?? NaN;
        })
      };
    }) ?? [];

  return {
    series: series.map((s) => ({ data: s, xAxisValues })),
    values: series.map((s) => {
      const value = Object.values(s)[0];
      return {
        name: Object.keys(s)[0],
        last: value[value.length - 1],
        min: Math.min(...value),
        max: Math.max(...value)
      };
    })
  };
}

function getFitedValue(
  n: number,
  interval: number,
  precision: number,
  fn: (n: number, p: number) => number
) {
  const m = fn(n, precision);
  return mod(m, interval) === 0 ? m : multiply(fn(n / interval, 0), interval);
}

function pickPrecisionFromInterval(interval: number) {
  const pos = interval.toString().indexOf('.') + 1;
  return pos === 0 ? 0 : interval.toString().length - pos;
}

function add(x: number, y: number) {
  return Number(Mathjs.format(Mathjs.add(Mathjs.bignumber(x), Mathjs.bignumber(y))));
}
function multiply(x: number, y: number) {
  return Number(Mathjs.format(Mathjs.multiply(Mathjs.bignumber(x), Mathjs.bignumber(y))));
}
function mod(x: number, y: number) {
  return Number(Mathjs.format(Mathjs.mod(Mathjs.bignumber(x), Mathjs.bignumber(y))));
}
function sub(x: number, y: number) {
  return Number(Mathjs.format(Mathjs.subtract(Mathjs.bignumber(x), Mathjs.bignumber(y))));
}
