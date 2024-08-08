import React from 'react';
import { Empty, Select, Spin } from 'antd';
import intl from 'react-intl-universal';
import { useAnalysisContext } from '.';
import { PropertyChart } from '../../../components/charts/propertyChart';
import { timeEnvelope } from '../services';
import { ChartHead } from './chartHead';
import { defaultChartSettings } from './useAnalysis';
import { isEqual } from 'lodash';

export const TimeEnvelope = () => {
  const { activeKey, trendData, timestamps, sub, originalDomain } = useAnalysisContext();
  const { subProperties, axies, setAxies } = sub;
  const { setData } = trendData;
  const isExistedTimestamps = timestamps.length > 0;
  const [loading, setLoading] = React.useState(true);
  const [subData, setSubData] = React.useState<{ x: number[]; y: number[] }>();
  const property = subProperties.find((p) => p.value === 'acceleration');
  const [chartSettings, setChartSettings] = React.useState(defaultChartSettings);

  React.useEffect(() => {
    if (property?.value && originalDomain.values && originalDomain.values.length > 0) {
      setLoading(true);
      timeEnvelope({
        property: property?.value,
        data: originalDomain.values,
        fs: chartSettings.fs,
        full_scale: chartSettings.full_scale,
        range: chartSettings.range,
        window: chartSettings.window,
        cutoff_range_high: chartSettings.cutoff_range_high,
        cutoff_range_low: chartSettings.cutoff_range_low,
        filter_type: chartSettings.filter_type,
        filter_order: chartSettings.filter_order
      })
        .then(({ x, y }) => setSubData({ x, y }))
        .finally(() => setLoading(false));
    }
  }, [originalDomain.values, property?.value, chartSettings]);

  const renderChartArea = () => {
    if (!isExistedTimestamps) {
      return (
        <div className='chart-card-content medium'>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ margin: 0 }} />
        </div>
      );
    } else {
      return (
        <>
          <div className='chart-card-filters'>
            <Select
              options={timestamps}
              onChange={(value) =>
                setData((prev) => prev?.map((d) => ({ ...d, selected: d.timestamp === value })))
              }
              value={timestamps.find((p) => p.selected)?.value}
              style={{ marginRight: 6 }}
            />
            <Select
              options={axies.map((a) => ({ ...a, label: intl.get(a.label) }))}
              onChange={(value) =>
                setAxies(axies.map((a) => ({ ...a, selected: a.value === value })))
              }
              value={axies.find((a) => a.selected)?.value}
            />
          </div>
          <div className='chart-card-content medium'>{renderChart()}</div>
        </>
      );
    }
  };
  const chart = React.useRef<any>();
  const renderChart = () => {
    if (!subData) {
      if (loading) {
        return <Spin />;
      } else {
        return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ margin: 0 }} />;
      }
    } else {
      return (
        <PropertyChart
          dataZoom={true}
          loading={loading}
          rawOptions={{ animation: false }}
          ref={chart}
          series={[
            {
              data: { [intl.get('time.envelope')]: subData.y },
              xAxisValues: subData.x.map((n, i) => i)
            },
            {
              data: { [intl.get('signal')]: subData.x },
              xAxisValues: subData.x.map((n, i) => i)
            }
          ]}
          xAxis={{ type: 'value' }}
          yAxis={{ unit: property?.unit }}
        />
      );
    }
  };

  return (
    <div className='chart-card'>
      <ChartHead
        activeKey={activeKey}
        chartInstance={chart.current}
        onSetChartSettings={(values) => {
          if (!isEqual(values, chartSettings)) {
            setChartSettings((prev) => ({ ...prev, ...values }));
          }
        }}
      />
      {renderChartArea()}
    </div>
  );
};
