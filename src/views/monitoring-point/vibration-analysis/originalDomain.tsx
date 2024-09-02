import React from 'react';
import { Empty, Select, Spin } from 'antd';
import intl from 'react-intl-universal';
import { useAnalysisContext } from '.';
import { PropertyChart } from '../../../components/charts/propertyChart';
import { useFetchingOriginalDomain } from './useAnalysis';
import { ChartHead } from './chartHead';

export const OriginalDomain = () => {
  const { activeKey, trendData, timestamps, sub, originalDomain, setOriginalDomain } =
    useAnalysisContext();
  const { subProperties, axies, setAxies } = sub;
  const { setData } = trendData;
  const isExistedTimestamps = timestamps.length > 0;
  const timestamp = timestamps.find((t) => !!t.selected);
  const property = subProperties.find((p) => !!p.selected);
  const axis = axies.find((a) => !!a.selected);

  const { loading, values, xAxis } = originalDomain;

  useFetchingOriginalDomain(timestamp?.id, timestamp?.value, axis?.value, setOriginalDomain);

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
              style={{ width: 80 }}
            />
          </div>
          <div className='chart-card-content medium'>{renderChart()}</div>
        </>
      );
    }
  };
  const chart = React.useRef<any>();
  const renderChart = () => {
    if (!xAxis || !values) {
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
          series={[
            {
              data: { [intl.get(axis?.label!)]: values! },
              xAxisValues: xAxis!
            }
          ]}
          xAxis={{ unit: 'ms', type: 'value' }}
          yAxis={{ unit: property?.unit }}
          ref={chart}
        />
      );
    }
  };

  return (
    <div className='chart-card'>
      <ChartHead activeKey={activeKey} chartInstance={chart.current} showToolbar={!!values} />
      {renderChartArea()}
    </div>
  );
};
