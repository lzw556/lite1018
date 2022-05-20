export type Title = {
  text: string;
  left?: 'left' | 'center';
  top?: 'top' | 'center';
  textStyle?: { color: string };
};

export type Legend = {
  bottom: number;
};

export type XAxis = {
  type: 'category';
  data: number[] | string[];
};
export type YAxis = {
  type: 'category' | 'value';
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
  color: ['rgb(0,130,252)', 'rgb(253,216,69)', 'rgb(34,237,124)']
};

export const COMMON_OPTIONS_SERIES = {
  // label: {
  //   color: '#8a8e99'
  // }
};
