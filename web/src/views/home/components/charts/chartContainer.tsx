import { Empty } from 'antd';
import EChartsReact from 'echarts-for-react';
import { cloneDeep, merge } from 'lodash';
import * as React from 'react';
import { ChartOptions, COMMON_OPTIONS, COMMON_OPTIONS_SERIES } from './common';

export const ChartContainer = <T,>({
  title,
  style,
  options
}: {
  title: string;
  style?: React.CSSProperties;
  options?: ChartOptions<T>;
}) => {
  const genericOps = cloneDeep(COMMON_OPTIONS);
  const _ops = merge(genericOps, {
    ...options,
    series: options?.series.map((item: any) => ({
      ...item,
      label: { ...COMMON_OPTIONS_SERIES.label, ...item.label }
    }))
  });

  if (!options)
    return (
      <>
        <p style={{ textAlign: 'center' }}>{title}</p>
        <Empty description='暂无数据' image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </>
    );
  return (
    <div className='chart-container'>
      {title && <h3 className='chart-title'>{title}</h3>}
      <EChartsReact option={_ops} style={style} notMerge={true} />
    </div>
  );
};
