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
  markLine?: any;
  raw?: any;
  xAxisValues: string[] | number[];
}

type XAxis = {
  data?: string[];
  unit?: string;
  labelLimit?: boolean;
  type?: string;
  precision?: number;
};
type YAxis = { interval?: number; unit?: string; precision?: number; showName?: boolean };

export const PropertyChart = React.forwardRef(function PropertyChart(
  {
    dataZoom = false,
    dispatchActionOption,
    enableSavingAsImage = false,
    hideLegend = false,
    linedComment,
    loading,
    onlyShowLastAxisInLegendByDefault = false,
    onSeriesPointClick,
    pointedComments = { data: [], mode: 'single' },
    rawOptions,
    series,
    style,
    withArea = false,
    xAxis,
    yAxis
  }: {
    dataZoom?: boolean | NonNullable<object>;
    dispatchActionOption?: any;
    enableSavingAsImage?: boolean;
    hideLegend?: boolean;
    linedComment?: string;
    loading?: boolean;
    onlyShowLastAxisInLegendByDefault?: boolean;
    onSeriesPointClick?: (points: [string | number, number][]) => void;
    pointedComments?: {
      data: [string, number][];
      mode?: 'single' | 'double' | 'multi';
    };
    rawOptions?: any;
    series: Series[];
    style?: CSSProperties;
    withArea?: boolean;
    xAxis?: XAxis;
    yAxis: YAxis;
  },
  ref: React.ForwardedRef<EChartsInstance>
) {
  const buildOptions = () => {
    let grid = ChartStyle.Grid;
    const dz = buildDataZoom();
    if (dz !== null) {
      grid = { ...grid, bottom: '13%' };
    }
    if (xAxis?.unit) {
      grid = { ...grid, right: '40' };
    }
    if (series.length === 0) return null;
    let mainXAxisValues = series[0].xAxisValues;
    if (series.filter((s) => s.main).length > 0) {
      mainXAxisValues = series.filter((s) => s.main)[0].xAxisValues;
    }
    if (xAxis?.data) {
      mainXAxisValues = xAxis.data;
    }
    return {
      color: ChartStyle.Colors,
      dataset: buildDataSet(),
      dataZoom: dz,
      grid,
      legend: getSelectedLegends(),
      ...rawOptions,
      series: buildSeries(),
      toolbox: {
        feature: { saveAsImage: enableSavingAsImage && { title: intl.get('SAVE_AS_IMAGE') } }
      },
      tooltip: buildTooltip(),
      xAxis: {
        data: mainXAxisValues,
        type: xAxis?.type ?? 'category',
        encode: {
          seriesName: [1]
        },
        boundaryGap: false,
        axisLabel: {
          align: 'left',
          hideOverlap: true,
          showMaxLabel: xAxis?.labelLimit,
          formatter: (val: string, index: number) => {
            if (xAxis?.labelLimit) {
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
        name: xAxis?.unit
      },
      yAxis: {
        type: 'value',
        ...ChartStyle.DashedSplitLine,
        min: (values: { min: number; max: number }) => {
          if (!Number.isNaN(values.min) && !Number.isNaN(values.max)) {
            const max = _.round(values.max, yAxis.precision);
            const min = _.round(values.min, yAxis.precision);
            const option = buildYAxisOption(max, min);
            intervalOfYAxisRef.current = option?.interval;
            return option?.min;
          }
        },
        max: (values: { min: number; max: number }) => {
          if (!Number.isNaN(values.min) && !Number.isNaN(values.max)) {
            const max = _.round(values.max, yAxis.precision);
            const min = _.round(values.min, yAxis.precision);
            const option = buildYAxisOption(max, min);
            return option?.max;
          }
        },
        name: yAxis.showName && yAxis.unit,
        axisLabel: { hideOverlap: true }
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
    if (hideLegend) {
      return { show: false };
    } else if (series.length > 1 && onlyShowLastAxisInLegendByDefault === true) {
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
        showSymbol: false,
        encode: {
          seriesName: [1]
        },
        ...s.raw
      };
      return withArea ? { ...options, ...setAreaStyle(ChartStyle.Colors[i]) } : options;
    });
  };

  const buildTooltip = () => {
    return {
      trigger: 'axis',
      formatter: (
        paras: { value: [string | number, number]; marker: string; seriesName: string }[]
      ) => {
        return buildTooltipStr(paras, xAxis, yAxis);
      },
      confine: true
    };
  };

  const buildYAxisOption = (max: number, min: number) => {
    const SPLIT_NUMBER = 6;
    const initialInterval = yAxis.interval;
    if (!initialInterval) return null;
    const precision = pickPrecisionFromInterval(initialInterval);
    const newMax = getFitedValue(max, initialInterval, precision, _.ceil);
    const newMin = getFitedValue(min, initialInterval, precision, _.floor);
    const fitAllInterval = add(newMin, multiply(SPLIT_NUMBER, initialInterval)) > newMax;
    let interval = initialInterval;
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

  React.useEffect(() => {
    const handleResize = () => {
      const ins = chartInstanceRef.current?.getEchartsInstance();
      if (ins) {
        ins.resize();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  React.useEffect(() => {
    const ins = chartInstanceRef.current?.getEchartsInstance();

    const appendLinedComment = (series: any, linedComment: string | number) => {
      const opts = {
        lineStyle: { color: '#FF0000', width: 2 },
        name: 'linedComment',
        xAxis: linedComment
      };
      const prevMarkLine = series.markLine;
      const markLineDatas = prevMarkLine
        ? [...prevMarkLine.data.filter((d: any) => d.name !== 'linedComment'), opts]
        : [opts];

      return markLineDatas.length > 0
        ? {
            ...series,
            markLine: {
              ...series.markLine,
              symbol: 'none',
              animation: false,
              label: { show: false },
              data: markLineDatas
            }
          }
        : series;
    };

    const renderPointedComments = (
      series: any,
      pointComments: [string | number, number],
      mode: 'single' | 'double' | 'multi' = 'single'
    ) => {
      const opts = {
        name: 'pointedComment',
        label: {
          show: true,
          position: 'top',
          color: '#FF0000',
          formatter: ({ dataIndex, value }: { dataIndex: number; value: string }) =>
            `${dataIndex + 1}\n${value}`
        },
        symbol:
          'path://M392.448255 0h238.494873v635.98633h-238.494873zM495.00105 1016.783145L155.543347 677.325441A23.849487 23.849487 0 0 1 172.237988 635.98633h678.915407a23.849487 23.849487 0 0 1 16.694641 41.339111l-338.662721 339.457704a23.849487 23.849487 0 0 1-34.184265 0zM392.448255 0h238.494873v635.98633h-238.494873zM495.00105 1016.783145L155.543347 677.325441A23.849487 23.849487 0 0 1 172.237988 635.98633h678.915407a23.849487 23.849487 0 0 1 16.694641 41.339111l-338.662721 339.457704a23.849487 23.849487 0 0 1-34.184265 0z',
        symbolSize: [8, 32],
        symbolOffset: [0, -20],
        itemStyle: { color: '#FF0000' }
      };
      const prevMarkPoints = series.markPoint;
      let markPointDatas: any = [];
      if (prevMarkPoints) {
        const prevPointedCommentsValue = prevMarkPoints.data
          .filter(
            (d: any) =>
              d.name === 'pointedComment' && d.value === `${pointComments[0]} ${pointComments[1]}`
          )
          .map((d: any) => d.value);
        if (prevPointedCommentsValue.length > 0) {
          markPointDatas = prevMarkPoints.data.filter(
            (d: any) => !prevPointedCommentsValue.includes(d.value)
          );
        } else {
          markPointDatas = [
            ...prevMarkPoints.data.filter((d: any, i: number) => {
              if (mode === 'double') {
                return prevMarkPoints.data.length > 1 ? i !== 0 : true;
              } else if (mode === 'multi') {
                return true;
              } else {
                return d.name !== 'pointedComment';
              }
            }),
            { ...opts, coord: pointComments, value: `${pointComments[0]} ${pointComments[1]}` }
          ];
        }
      } else {
        markPointDatas = [
          {
            ...opts,
            coord: pointComments,
            value: `${pointComments[0]} ${pointComments[1]}`
          }
        ];
      }
      return markPointDatas.length > 0
        ? {
            ...series,
            markPoint: {
              animation: false,
              ...series.markPoint,
              data: markPointDatas
            }
          }
        : series;
    };

    const handleChartClick = (paras: any) => {
      const pointInPixel = [paras.offsetX, paras.offsetY];
      if (ins.containPixel('grid', pointInPixel)) {
        const points: [string | number, number][] = series.map((s, i) => {
          const xIndex = ins.convertFromPixel({ seriesIndex: i }, pointInPixel)[0];
          const yAxisValues = Object.values(s.data)[0];
          const x = s.xAxisValues[xIndex];
          const y = yAxisValues[xIndex];
          return [x, y];
        });
        if (linedComment && points.length > 0) {
          ins.setOption({
            series: ins.getOption().series.map((s: any, i: number) => {
              return appendLinedComment(s, points[i][0]);
            })
          });
          if (onSeriesPointClick && points.length > 0) {
            onSeriesPointClick(points);
          }
        } else if (pointedComments && pointedComments.data.length > 0 && points.length > 0) {
          ins.setOption({
            series: ins
              .getOption()
              .series.map((s: any, i: number) =>
                renderPointedComments(s, points[i], pointedComments.mode)
              )
          });
          if (onSeriesPointClick && points.length > 0) {
            onSeriesPointClick(points);
          }
        }
      }
    };
    if (ins) {
      if (linedComment) {
        ins.setOption({
          series: ins.getOption().series.map((s: any) => appendLinedComment(s, linedComment))
        });
      }
      if (pointedComments && pointedComments.data.length > 0) {
        ins.setOption({
          series: ins
            .getOption()
            .series.map((s: any, i: number) => renderPointedComments(s, pointedComments.data[i]))
        });
      }
      ins.getZr().on('click', handleChartClick);
    }

    return () => {
      if (ins && ins.getZr()) {
        ins.getZr().off('click', handleChartClick);
      }
    };
  }, [series, linedComment, pointedComments, onSeriesPointClick]);

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
  naming?: { replace?: string; prefix?: string },
  fieldName?: string
) {
  if (origin.length === 0) return null;
  const xAxisValues = origin.map(({ timestamp }) =>
    dayjs.unix(timestamp).local().format('YYYY-MM-DD HH:mm:ss')
  );
  const series =
    property.fields
      ?.filter((f) => (fieldName ? f.name === fieldName : true))
      .map((f) => {
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
        min: roundValue(Math.min(...value), property.precision),
        max: roundValue(Math.max(...value), property.precision)
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
function buildTooltipStr(
  paras: { value: [string | number, number]; marker: string; seriesName: string }[],
  xAxis: XAxis | undefined,
  yAxis: YAxis
) {
  if (paras.length === 0) {
    return null;
  }
  const xAxisValue = paras[0].value[0];
  const formattedXAxisValue =
    typeof xAxisValue === 'number'
      ? getValue(roundValue(xAxisValue, xAxis?.precision))
      : xAxisValue;
  let tooltipStr = `<div style='margin: 0px 0 0; line-height: 1'>
      <div style='margin: 0px 0 0; line-height: 1'>
        <div style='font-size: 14px; color: #666; font-weight: 400; line-height: 1'>
          ${formattedXAxisValue} ${xAxis?.unit ?? ''}
        </div>
        <div style='margin: 10px 0 0; line-height: 1'>
           `;
  paras.forEach(({ marker, seriesName, value }, i) => {
    const formattedValue = getValue(roundValue(value[1], yAxis.precision));
    tooltipStr += buildTooltipItemStr(
      marker,
      seriesName,
      formattedValue,
      i === 0 ? 0 : 10,
      formattedValue !== '-' ? yAxis.unit : ''
    );
  });
  return (
    tooltipStr +
    `     </div>
       </div>
     </div>`
  );
}

function buildTooltipItemStr(
  marker: string,
  seriesName: string,
  value: string,
  marginTop: number,
  unit: string = ''
) {
  return `<div style='margin: ${marginTop}px 0 0; line-height: 1'>
            <div style='margin: 0px 0 0; line-height: 1'>
              ${marker}<span style='font-size: 14px; color: #666; font-weight: 400; margin-left: 2px'>${seriesName}
              </span>
              <span style='float: right; margin-left: 20px; font-size: 14px; color: #666;'>
                <span style='font-weight: 900'>${value}</span> ${unit}
              </span>
              <div style='clear: both'></div>
            </div>
          </div>`;
}
