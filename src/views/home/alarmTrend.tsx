import * as React from 'react';
import { Spin } from 'antd';
import intl from 'react-intl-universal';
import dayjs from '../../utils/dayjsUtils';
import { GetAlertStatisticsRequest } from '../../apis/statistic';
import { ColorDanger, ColorInfo, ColorWarn } from '../../constants/color';
import { ChartContainer } from '../../components/charts/chartContainer';

type Statistics = { timestamp: number; info: number; warn: number; critical: number };
export const AlarmTrend: React.FC<{ title: string }> = ({ title }) => {
  const [loading, setLoading] = React.useState(true);
  const [countAlarm, setCountAlarm] = React.useState<Statistics[]>([]);
  React.useEffect(() => {
    GetAlertStatisticsRequest(undefined).then((data) => {
      setLoading(false);
      setCountAlarm(data);
    });
  }, []);

  const hasValidData = (data: Statistics[]) => {
    if (data.length === 0) return false;
    if (
      data.map(({ info }) => info).every((n) => n === 0) &&
      data.map(({ warn }) => warn).every((n) => n === 0) &&
      data.map(({ critical }) => critical).every((n) => n === 0)
    )
      return false;
    return true;
  };

  const generateOptions = (data: Statistics[]) => {
    const xAxisData: any = [],
      info: any = [],
      warn: any = [],
      danger: any = [];
    if (data.length > 0) {
      xAxisData.push(...data.map(({ timestamp }) => dayjs.unix(timestamp).local().format('MM/DD')));
      info.push(...data.map(({ info }) => info));
      warn.push(...data.map(({ warn }) => warn));
      danger.push(...data.map(({ critical }) => critical));
    }

    return {
      title: {
        text: '',
        left: 'center',
        top: 'center'
      },
      legend: {
        bottom: 20
      },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: xAxisData
      },
      yAxis: { type: 'value', minInterval: 1 },
      series: [
        {
          type: 'bar',
          name: intl.get('ALARM_LEVEL_MINOR'),
          data: info,
          color: ColorInfo
        },
        {
          type: 'bar',
          name: intl.get('ALARM_LEVEL_MAJOR'),
          data: warn,
          color: ColorWarn
        },
        {
          type: 'bar',
          name: intl.get('ALARM_LEVEL_CRITICAL'),
          data: danger,
          color: ColorDanger
        }
      ]
    };
  };

  if (loading) return <Spin />;
  return (
    <ChartContainer
      title={title}
      options={hasValidData(countAlarm) ? (generateOptions(countAlarm) as any) : null}
    />
  );
};
