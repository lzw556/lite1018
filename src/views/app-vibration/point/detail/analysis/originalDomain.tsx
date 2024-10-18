import React from 'react';
import { Empty, Select, Spin } from 'antd';
import intl from 'react-intl-universal';
import { useAnalysisContext } from '.';
import { useFetchingOriginalDomain } from './useAnalysis';
import { ChartHead } from './chartHead';
import { PropertyChart } from '../../../../../components/charts/propertyChart';

export const OriginalDomain = () => {
  const {
    activeKey,
    trendData,
    timestamps,
    sub,
    originalDomain,
    originalDomainLoading,
    setOriginalDomain,
    setOriginalDomainLoading
  } = useAnalysisContext();
  const { subProperties, axies, setAxies } = sub;
  const { setData } = trendData;
  const isExistedTimestamps = timestamps.length > 0;
  const timestamp = timestamps.find((t) => !!t.selected);
  const property = subProperties.find((p) => !!p.selected);
  const axis = axies.find((a) => !!a.selected);

  useFetchingOriginalDomain(
    timestamp?.id,
    timestamp?.value,
    axis?.value,
    setOriginalDomain,
    setOriginalDomainLoading
  );

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
    if (!originalDomain) {
      if (originalDomainLoading) {
        return <Spin />;
      } else {
        return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ margin: 0 }} />;
      }
    } else {
      const { xAxis, values } = originalDomain;
      return (
        <PropertyChart
          dataZoom={{ start: 0, end: 100 }}
          hideLegend={true}
          loading={originalDomainLoading}
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
      <ChartHead
        activeKey={activeKey}
        chartInstance={chart.current}
        showToolbar={!!originalDomain?.values}
      />
      {renderChartArea()}
    </div>
  );
};
