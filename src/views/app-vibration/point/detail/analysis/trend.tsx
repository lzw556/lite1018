import React from 'react';
import { Empty, Select, Spin } from 'antd';
import intl from 'react-intl-universal';
import { useAnalysisContext } from '.';
import { ChartHead } from './chartHead';
import { PropertyChart } from '../../../../../components/charts/propertyChart';
import dayjs from '../../../../../utils/dayjsUtils';
import { saveAsImage } from '../../../../../utils/image';
import { RangeDatePicker } from '../../../../../components/rangeDatePicker';

export const Trend = () => {
  const { title, range, setRange, properties, setProperties, trendData, seriesOpts } =
    useAnalysisContext();
  const { loading, data, setData } = trendData;
  const chart = React.useRef<any>();

  const renderChartContent = () => {
    if (loading) {
      return <Spin />;
    } else if (data?.length === 0) {
      return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ margin: 0 }} />;
    } else if (seriesOpts) {
      const selected = data?.find(({ selected }) => !!selected)?.timestamp;
      return (
        <PropertyChart
          hideLegend={true}
          loading={loading}
          ref={chart}
          series={seriesOpts}
          yAxis={{ precision: 3 }}
          linedComment={
            selected ? dayjs.unix(selected).local().format('YYYY-MM-DD HH:mm:ss') : undefined
          }
          onSeriesPointClick={(points) => {
            if (points.length > 0) {
              setData((prev) =>
                prev?.map((d) => ({
                  ...d,
                  selected: d.timestamp === dayjs(points[0][0]).utc().unix()
                }))
              );
            }
          }}
          rawOptions={{ animation: false }}
        />
      );
    }
  };

  return (
    <div className='chart-card'>
      <ChartHead
        title={title}
        onSaveAsImage={(title) => {
          if (chart.current) {
            saveAsImage(
              chart.current.getEchartsInstance().getDataURL({ backgroundColor: '#fff' }),
              title
            );
          }
        }}
        showToolbar={data?.length !== 0}
      />
      <div className='chart-card-filters'>
        <Select
          options={properties.map((p) => ({ ...p, label: intl.get(p.label) }))}
          onChange={(value) =>
            setProperties(properties.map((p) => ({ ...p, selected: p.value === value })))
          }
          value={properties.find((p) => p.selected)?.value}
          style={{ marginRight: 6 }}
        />
        <RangeDatePicker onChange={setRange} value={range} />
      </div>
      <div className='chart-card-content small'>{renderChartContent()}</div>
    </div>
  );
};
