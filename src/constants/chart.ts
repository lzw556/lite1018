import { ColorHealth } from './color';

export const DefaultGaugeOption = {
  series: [
    {
      name: 'Pressure',
      type: 'gauge',
      progress: {
        show: true
      },
      pointer: {
        show: false //是否显示指针
      },
      itemStyle: {
        color: ColorHealth
      },
      detail: {
        fontSize: 28,
        valueAnimation: true,
        offsetCenter: [0, 0],
        formatter: '{value}%'
      },
      axisTick: false,
      axisLabel: false,
      splitLine: {
        show: false
      },
      data: [
        {
          value: 50
        }
      ],
      label: {
        show: true
      }
    }
  ]
};

export const ChartStyle = {
  Colors: [
    '#0084FC',
    '#FDD845',
    '#22ED7C',
    '#5470c6',
    '#91cc75',
    '#fac858',
    '#ee6666',
    '#73c0de',
    '#3ba272'
  ],
  LineSeries: {
    type: 'line',
    // symbol: 'none',
    colorBy: 'series'
  },
  DashedSplitLine: {
    splitLine: {
      lineStyle: {
        type: 'dashed'
      }
    },
    show: true
  },
  Grid: {
    top: '15%',
    bottom: '10%',
    right: '16',
    left: '16',
    containLabel: true
  }
};
