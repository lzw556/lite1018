import React from 'react';
import { Empty, Select, Spin } from 'antd';
import intl from 'react-intl-universal';
import { useAnalysisContext } from '.';
import { frequency } from '../services';
import { ChartHead } from './chartHead';
import { PropertyChart } from '../../../components/charts/propertyChart';
import { defaultChartSettings } from './useAnalysis';

export const Frequency = () => {
  const { activeKey, trendData, timestamps, sub, originalDomain } = useAnalysisContext();
  const { subProperties, setSubProperties, axies, setAxies } = sub;
  const { setData } = trendData;
  const isExistedTimestamps = timestamps.length > 0;
  const [loading, setLoading] = React.useState(true);
  const [subData, setSubData] = React.useState<{ x: number[]; y: number[] }>();
  const property = subProperties.find((p) => !!p.selected);
  const axis = axies.find((a) => !!a.selected);

  React.useEffect(() => {
    if (property?.value && originalDomain.values && originalDomain.values.length > 0) {
      setLoading(true);
      frequency({
        property: property.value,
        data: originalDomain.values,
        fs: defaultChartSettings.fs,
        full_scale: defaultChartSettings.full_scale,
        range: defaultChartSettings.range,
        window: 'hann'
      })
        .then(({ x, y }) => setSubData({ x, y }))
        .finally(() => setLoading(false));
    }
  }, [property?.value, originalDomain.values]);

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
              options={subProperties.map((p) => ({ ...p, label: intl.get(p.label) }))}
              onChange={(value) =>
                setSubProperties(subProperties.map((p) => ({ ...p, selected: p.value === value })))
              }
              value={subProperties.find((p) => p.selected)?.value}
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
          hideLegend={true}
          loading={loading}
          rawOptions={{ animation: false }}
          ref={chart}
          series={[
            {
              data: { [intl.get(axis?.label!)]: subData.y },
              xAxisValues: subData.x
            }
          ]}
          xAxis={{ unit: 'Hz', type: 'value' }}
          yAxis={{ unit: property?.unit }}
        />
      );
    }
  };

  return (
    <div className='chart-card'>
      <ChartHead activeKey={activeKey} chartInstance={chart.current} />
      {renderChartArea()}
    </div>
  );
};
