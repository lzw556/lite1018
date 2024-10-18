import React from 'react';
import { Empty, Select, Space, Spin } from 'antd';
import intl from 'react-intl-universal';
import { useAnalysisContext } from '.';
import { ChartHead } from './chartHead';
import { frequency } from '../../../../asset-common';
import { PropertyChart } from '../../../../../components/charts/propertyChart';

export const Frequency = () => {
  const { activeKey, trendData, timestamps, sub, originalDomain } = useAnalysisContext();
  const { subProperties, setSubProperties, axies, setAxies, timeDomain } = sub;
  const { setData } = trendData;
  const isExistedTimestamps = timestamps.length > 0;
  const [loading, setLoading] = React.useState(true);
  const [subData, setSubData] = React.useState<{ x: number[]; y: number[] }>();
  const property = subProperties.find((p) => !!p.selected);
  const axis = axies.find((a) => !!a.selected);

  React.useEffect(() => {
    if (property?.value && originalDomain) {
      const { frequency: fs, fullScale, range, values } = originalDomain;
      setLoading(true);
      frequency({
        property: property.value,
        data: values,
        fs,
        full_scale: fullScale,
        range,
        window: 'hann'
      })
        .then(({ x, y }) => setSubData({ x, y }))
        .finally(() => setLoading(false));
    } else {
      setSubData(undefined);
    }
  }, [property?.value, originalDomain]);

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
          xAxis={{ unit: 'Hz', type: 'value' }}
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
          timeDomain && (
            <Space style={{ marginLeft: 30 }}>
              {[
                { name: intl.get('SETTING_RANGE'), value: `${timeDomain?.range}g` },
                {
                  name: intl.get('SETTING_SAMPLING_FREQUNECY'),
                  value: `${timeDomain?.frequency}Hz`
                },
                { name: intl.get('SETTING_SAMPLING_NUMBER'), value: timeDomain?.number }
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
