export type Series_Bar = {
  type: 'bar';
  name: string;
  data: number[] | { name: string; value: number; itemStyle?: { color: string } }[];
};
