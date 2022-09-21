export type Title = {
  text: string;
  left?: 'left' | 'center';
  top?: 'top' | 'center' | number;
  textStyle?: { color: string };
};

export type Legend = {
  data?: { name: string; itemStyle?: { color: string }; icon?: string }[];
  bottom: number | string;
  itemGap?: number;
  itemWidth?: number;
  itemHeight?: number;
  textStyle?: any
  formatter?: any;
  width?: number | string;
  left?: any;
};

export type XAxis = {
  type: string;
  data?: number[] | string[];
};
export type YAxis = {
  type: 'category' | 'value';
  minInterval?: number;
  min?: number;
  max?: number;
};
export type Tooltip = {
  trigger: 'item' | 'axis';
};

export type ChartOptions<SeriesOptions> = {
  title: Title;
  legend: Legend;
  series: SeriesOptions[];
  tooltip?: Tooltip;
  xAxis?: XAxis;
  yAxis?: YAxis;
  label?: any;
};

export const COMMON_OPTIONS = {
  title: {
    textStyle: { color: '#8a8e99', fontWeight: 400, fontSize: 14 }
  },
  legend: {
    textStyle: { color: '#8a8e99' }
  },
  tooltip: {
    trigger: 'item'
  },
  color: ['rgb(0,130,252)', 'rgb(253,216,69)', 'rgb(34,237,124)', '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de']
};

export const COMMON_OPTIONS_SERIES = {
  label: {
    color: '#8a8e99'
  }
};
