import React from 'react';
import { Empty, Select, Spin } from 'antd';
import { isEqual } from 'lodash';
import intl from 'react-intl-universal';
import EChartsReact from 'echarts-for-react';
import 'echarts-gl';
import { useAnalysisContext } from '.';
import { ChartHead } from './chartHead';
import { defaultChartSettings } from './useAnalysis';
import { timeFrequency } from '../../../../asset-common';
import { ChartStyle } from '../../../../../constants/chart';

export const TimeFrequency = () => {
  const { activeKey, trendData, timestamps, sub, originalDomain } = useAnalysisContext();
  const { subProperties, setSubProperties, axies, setAxies } = sub;
  const { setData } = trendData;
  const isExistedTimestamps = timestamps.length > 0;
  const [loading, setLoading] = React.useState(true);
  const [subData, setSubData] = React.useState<{ x: number[]; y: number[]; z: number[][] }>();
  const property = subProperties.find((p) => !!p.selected);
  const [chartSettings, setChartSettings] = React.useState(defaultChartSettings);

  React.useEffect(() => {
    if (property?.value && originalDomain) {
      const { frequency, fullScale, range, values } = originalDomain;
      setLoading(true);
      timeFrequency({
        property: property.value,
        data: values,
        fs: frequency,
        full_scale: fullScale,
        range,
        window_length: chartSettings.window_length
      })
        .then(setSubData)
        .finally(() => setLoading(false));
    } else {
      setSubData(undefined);
    }
  }, [property?.value, originalDomain, chartSettings]);

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
      const { x, y, z } = subData;
      return (
        <EChartsReact
          notMerge={true}
          ref={chart}
          showLoading={loading}
          option={{
            color: ChartStyle.Colors,
            xAxis3D: {
              type: 'value',
              name: `${intl.get('FIELD_FREQUENCY')}（Hz）`
            },
            yAxis3D: {
              type: 'value',
              name: `${intl.get('TIMESTAMP')}（Hz）`
            },
            zAxis3D: {
              type: 'value',
              name: intl.get('amplitude')
            },
            grid3D: {},
            series: y.map((y, i) => ({
              type: 'line3D',
              data: x.map((n, j) => [n, y, z[j][i]])
            }))
          }}
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
        showToolbar={!!subData}
      />
      {renderChartArea()}
    </div>
  );
};
