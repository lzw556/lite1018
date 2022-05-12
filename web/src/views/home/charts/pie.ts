export type Series_Pie = {
  type: 'pie';
  name: string;
  data: { name: string; value: number; itemStyle: { color: string } }[];
  radius: [string, string];
  center: [string, string];
};
