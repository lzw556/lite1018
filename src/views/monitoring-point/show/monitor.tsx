import { Col, Empty, Row, Spin } from 'antd';
import React from 'react';
import { ChartContainer } from '../../../components/charts/chartContainer';
import { oneWeekNumberRange } from '../../../components/rangeDatePicker';
import { LineChartStyles } from '../../../constants/chart';
import dayjs from '../../../utils/dayjsUtils';
import { isMobile } from '../../../utils/deviceDetection';
import { getDisplayValue } from '../../../utils/format';
import { getHistoryDatas } from '../historyDataHelper';
import { getDataOfMonitoringPoint } from '../services';
import { HistoryData, MonitoringPointRow } from '../types';
import intl from 'react-intl-universal';

export const MonitoringPointMonitor = (point: MonitoringPointRow) => {
  const { id, type } = point;
  const [loading, setLoading] = React.useState(true);
  const [historyOptions, setHistoryOptions] = React.useState<any>();
  React.useEffect(() => {
    const [from, to] = oneWeekNumberRange;
    getDataOfMonitoringPoint(id, from, to).then((data) => {
      setLoading(false);
      if (data.length > 0) setHistoryOptions(generateChartOptionsOfHistoryDatas(data, type));
    });
  }, [id, type]);

  if (loading) return <Spin />;
  if (!historyOptions || historyOptions.length === 0)
    return <Empty description={intl.get('NO_DATA_PROMPT')} image={Empty.PRESENTED_IMAGE_SIMPLE} />;

  return (
    <Row gutter={[32, 32]}>
      {historyOptions.map((ops: any, index: number) => (
        <Col span={isMobile ? 24 : 6} key={index}>
          <ChartContainer title='' options={ops} />
        </Col>
      ))}
    </Row>
  );
};

export function generateChartOptionsOfHistoryDatas(
  data: HistoryData,
  measurementType: number,
  propertyKey?: string
) {
  const optionsData = getHistoryDatas(data, measurementType, propertyKey);
  return optionsData.map(({ times, seriesData, property }) => {
    return {
      tooltip: {
        trigger: 'axis',
        formatter: function (params: any) {
          let relVal = params[0].name;
          for (let i = 0; i < params.length; i++) {
            let value = Number(params[i].value);
            relVal += `<br/> ${params[i].marker} ${params[i].seriesName}: ${getDisplayValue(
              value,
              property.unit
            )}`;
          }
          return relVal;
        }
      },
      legend: { show: !!propertyKey },
      grid: { bottom: 20, left: 50 },
      title: {
        text: `${intl.get(property.name)}${property.unit ? `(${property.unit})` : ''}`,
        subtext: propertyKey
          ? ''
          : `${seriesData.map(({ name, data }) => intl.get(name) + ' ' + data[data.length - 1])}`
      },
      series: seriesData.map(({ name, data }, index) => ({
        type: 'line',
        name: intl.get(name),
        areaStyle: LineChartStyles[index].areaStyle,
        data
      })),
      xAxis: {
        type: 'category',
        boundaryGap: false,
        axisLabel: { align: 'left' },
        data: times.map((item) => dayjs.unix(item).local().format('YYYY-MM-DD HH:mm:ss'))
      },
      yAxis: { type: 'value' }
    };
  });
}
