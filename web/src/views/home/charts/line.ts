export type Series_Line = {
  type: 'line';
  name: string;
  data: number[] | { name: string; value: number; itemStyle?: { color: string } }[];
};
