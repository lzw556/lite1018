import { Empty } from 'antd';
import EChartsReact from 'echarts-for-react';
import { cloneDeep, merge } from 'lodash';
import * as React from 'react';
import { ChartOptions, COMMON_OPTIONS, COMMON_OPTIONS_SERIES } from './common';
import './chart.css';
import intl from 'react-intl-universal';

export const ChartContainer = <T,>({
  title,
  style,
  options,
  clickHandler,
  instanceRef
}: {
  title: string;
  style?: React.CSSProperties;
  options?: ChartOptions<T>;
  clickHandler?: (paras: any, instance: any) => void;
  instanceRef?: React.Ref<any>;
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
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <p style={{ textAlign: 'center' }}>{title}</p>
        <Empty
          description={intl.get('NO_DATA_PROMPT')}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{
            flex: '1 0 auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        />
      </div>
    );
  return (
    <div className='chart-container'>
      {title && <h3 className='chart-title'>{title}</h3>}
      <EChartsReact
        option={_ops}
        style={style}
        notMerge={true}
        onEvents={{ click: clickHandler ?? (() => {}) }}
        ref={instanceRef}
        opts={{ renderer: 'svg' }}
      />
    </div>
  );
};
