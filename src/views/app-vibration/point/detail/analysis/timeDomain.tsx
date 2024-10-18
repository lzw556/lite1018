import React from 'react';
import { Empty, Select, Space, Spin } from 'antd';
import intl from 'react-intl-universal';
import { useAnalysisContext } from '.';
import { OriginalDomainResponse } from './useAnalysis';
import { ChartHead } from './chartHead';
import { PropertyChart } from '../../../../../components/charts/propertyChart';
import { getDynamicData } from '../../../../asset-common';

export const TimeDomain = () => {
  const { activeKey, trendData, timestamps, sub } = useAnalysisContext();
  const { subProperties, setSubProperties, axies, setAxies, setTimeDomain } = sub;
  const { setData } = trendData;
  const isExistedTimestamps = timestamps.length > 0;
  const timestamp = timestamps.find((t) => !!t.selected);
  const property = subProperties.find((p) => !!p.selected);
  const axis = axies.find((a) => !!a.selected);
  const [loading, setLoading] = React.useState(true);
  const [subData, setSubData] = React.useState<{
    x: number[];
    y: number[];
    range: number;
    frequency: number;
    number: number;
  }>();
  React.useEffect(() => {
    if (
      timestamp?.id !== undefined &&
      timestamp?.value !== undefined &&
      property?.value !== undefined &&
      axis?.value !== undefined
    ) {
      setLoading(true);
      getDynamicData<{ values: OriginalDomainResponse; timestamp: number }>(
        timestamp.id,
        timestamp.value,
        'raw',
        {
          field: `${property.value}TimeDomain`,
          axis: axis.value
        }
      )
        .then((data) => {
          if (data) {
            const { xAxis, values, range, frequency, number } = data.values;
            if (xAxis.length > 0)
              setSubData({
                x: xAxis,
                y: values,
                range,
                frequency,
                number
              });
            setTimeDomain({
              range,
              frequency,
              number
            });
          }
        })
        .finally(() => setLoading(false));
    } else {
      setSubData(undefined);
    }
  }, [timestamp?.id, timestamp?.value, property?.value, axis?.value, setTimeDomain]);

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
    if (!subData) {
      if (loading) {
        return <Spin />;
      } else {
        return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ margin: 0 }} />;
      }
    } else {
      return (
        <PropertyChart
          dataZoom={{ start: 0, end: 100 }}
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
          xAxis={{ unit: 's', type: 'value' }}
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
        extra={
          subData && (
            <Space style={{ marginLeft: 30 }}>
              {[
                { name: intl.get('SETTING_RANGE'), value: `${subData?.range}g` },
                { name: intl.get('SETTING_SAMPLING_FREQUNECY'), value: `${subData?.frequency}Hz` },
                { name: intl.get('SETTING_SAMPLING_NUMBER'), value: subData?.number }
              ].map(({ name, value }) => (
                <span key={name}>
                  {name} <strong>{value}</strong>
                </span>
              ))}
            </Space>
          )
        }
        showToolbar={!!subData}
      />
      {renderChartArea()}
    </div>
  );
};
