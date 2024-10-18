import React from 'react';
import { Empty, Select, Spin } from 'antd';
import { isEqual } from 'lodash';
import EChartsReact from 'echarts-for-react';
import intl from 'react-intl-universal';
import { useAnalysisContext } from '.';
import { defaultChartSettings, useCrossComparison, useFetchingOriginalDomain } from './useAnalysis';
import { ChartHead } from './chartHead';
import { cross } from '../../../../asset-common';
import { ChartStyle } from '../../../../../constants/chart';
import { getValue, roundValue } from '../../../../../utils/format';

export const Cross = () => {
  const { activeKey, trendData, timestamps, sub, originalDomain } = useAnalysisContext();
  const { axies, setAxies } = sub;
  const { setData } = trendData;
  const isExistedTimestamps = timestamps.length > 0;
  const timestamp = timestamps.find((t) => !!t.selected);
  const [loading, setLoading] = React.useState(true);
  const [subData, setSubData] = React.useState<{
    density: number[];
    phase: number[];
    x: number[];
  }>();

  const { points, setPoints, trendProps, subProps } = useCrossComparison(timestamp?.id);
  const originalDomain2 = useFetchingOriginalDomain(
    points?.find((p) => !!p.selected)?.value,
    trendProps.timestamps.find((t) => !!t.selected)?.value,
    subProps.sub.axies.find((a) => !!a.selected)?.value
  );
  const [chartSettings, setChartSettings] = React.useState(defaultChartSettings);

  React.useEffect(() => {
    if (originalDomain && originalDomain2?.values) {
      const { frequency, fullScale, range, values } = originalDomain;
      setLoading(true);
      cross({
        data_x: values,
        data_y: originalDomain2.values,
        fs: frequency,
        full_scale: fullScale,
        range,
        window: chartSettings.window
      })
        .then(setSubData)
        .finally(() => setLoading(false));
    } else {
      setSubData(undefined);
    }
  }, [originalDomain, originalDomain2?.values, chartSettings]);

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
          <div className='chart-card-filters' style={{ justifyContent: 'space-between' }}>
            <div className='origin'>
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
            <div className='comparison'>
              <Select
                options={points}
                onChange={(value) =>
                  setPoints((prev) => prev?.map((d) => ({ ...d, selected: d.value === value })))
                }
                value={points?.find((p) => p.selected)?.value}
                style={{ marginRight: 6 }}
              />
              <Select
                options={trendProps.timestamps}
                onChange={(value) =>
                  trendProps.trendData.setData((prev) =>
                    prev?.map((d) => ({ ...d, selected: d.timestamp === value }))
                  )
                }
                value={trendProps.timestamps.find((p) => p.selected)?.value}
                style={{ marginRight: 6 }}
              />
              <Select
                options={subProps.sub.axies.map((a) => ({ ...a, label: intl.get(a.label) }))}
                onChange={(value) =>
                  subProps.sub.setAxies(
                    subProps.sub.axies.map((a) => ({ ...a, selected: a.value === value }))
                  )
                }
                value={subProps.sub.axies.find((a) => a.selected)?.value}
                style={{ width: 80 }}
              />
            </div>
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
        <>
          <EChartsReact
            notMerge={true}
            ref={chart}
            showLoading={loading}
            option={{
              color: ChartStyle.Colors,
              tooltip: {
                trigger: 'axis',
                valueFormatter: (v: number) => getValue(roundValue(v, 3)),
                confine: true
              },
              axisPointer: {
                link: [
                  {
                    xAxisIndex: 'all'
                  }
                ]
              },
              grid: [
                {
                  left: 60,
                  right: 50,
                  height: '35%'
                },
                {
                  left: 60,
                  right: 50,
                  top: '65%',
                  height: '35%'
                }
              ],
              xAxis: [
                {
                  type: 'category',
                  boundaryGap: false,
                  axisLine: { onZero: true },
                  data: subData.x
                },
                {
                  gridIndex: 1,
                  type: 'category',
                  boundaryGap: false,
                  axisLine: { onZero: true },
                  data: subData.x,
                  position: 'top'
                }
              ],
              yAxis: [
                {
                  type: 'value'
                },
                {
                  gridIndex: 1,
                  type: 'value',
                  inverse: true
                }
              ],
              series: [
                {
                  type: 'line',
                  data: subData.density,
                  name: intl.get('cross.power.spectral.density')
                },
                {
                  type: 'line',
                  xAxisIndex: 1,
                  yAxisIndex: 1,
                  data: subData.phase,
                  name: intl.get('cross.power.spectral.phase')
                }
              ]
            }}
          />
        </>
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
