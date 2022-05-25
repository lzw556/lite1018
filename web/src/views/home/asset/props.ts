import * as React from 'react';

export type Asset = {
  id: number;
  name: string;
  type: number;
  parent_id: number;
};

export type AssetRow = {
  id: number;
  name: string;
  type: number;
  parentId: number;
  ProjectID: number;
};

export function convertRow(values?: AssetRow): Asset | null {
  if (!values) return null;
  return { id: values.id, name: values.name, parent_id: values.parentId, type: values.type };
}

export function usePreloadChartOptions() {
  const [options, setOptions] = React.useState<any>(null);
  React.useEffect(() => {
    const data = [
      320, 320, 320, 320, 320, 320, 320, 320, 320, 320, 320, 320, 320, 320, 320, 320, 320, 320, 320,
      320
    ];
    const times = data.map((item: number, index: number) => `2022-04-${5 + index}`);

    const statisticOfPreload: any = {
      title: {
        text: '',
        left: 'center'
      },
      legend: { bottom: 0 },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: times
      },
      yAxis: { type: 'value', min: 290, max: 360 },
      series: [
        {
          type: 'line',
          name: '1号螺栓',
          data: data.map((item) => item + Math.random() * 10)
        },
        {
          type: 'line',
          name: '2号螺栓',
          data: data.map((item) => item + Math.random() * 10)
        },
        {
          type: 'line',
          name: '3号螺栓',
          data: data.map((item) => item + Math.random() * 10)
        },
        {
          type: 'line',
          name: '4号螺栓',
          data: data.map((item) => item + Math.random() * 10)
        },
        {
          type: 'line',
          name: '5号螺栓',
          data: data.map((item) => item + Math.random() * 10)
        },
        {
          type: 'line',
          name: '6号螺栓',
          data: data.map((item) => item + Math.random() * 10)
        },
        {
          type: 'line',
          name: '7号螺栓',
          data: [329, 328, 321, 325, 325, 329, 320, 328, 335, 328, 312, 311, 310, 330, 333]
        },
        {
          type: 'line',
          name: '8号螺栓',
          data: [334, 318, 331, 325, 335, 329, 330, 328, 335, 318, 312, 311, 310, 340, 333]
        }
      ]
    };
    setOptions(statisticOfPreload);
  }, []);
  return options;
}
