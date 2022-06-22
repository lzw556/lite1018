import { Spin } from 'antd';
import moment from 'moment';
import * as React from 'react';
import { GetAlertStatisticsRequest } from '../../apis/statistic';
import { ColorDanger, ColorInfo, ColorWarn } from '../../constants/color';
import { ChartContainer } from './components/charts/chartContainer';

type Statistics = { timestamp: number; info: number; warn: number; critical: number };
export const AlarmStatisticOfProject: React.FC<{ title: string }> = ({title}) => {
  const [loading, setLoading] = React.useState(true);
  const [countAlarm, setCountAlarm] = React.useState<Statistics[]>([]);
  React.useEffect(() => {
    GetAlertStatisticsRequest(undefined).then((data) => {
      setLoading(false);
      setCountAlarm(data);
    });
  }, []);

  const generateOptions = (data: Statistics[]) => {
    const xAxisData: any = [],
      info: any = [],
      warn: any = [],
      danger: any = [];
    if (data.length > 0) {
      xAxisData.push(
        ...countAlarm.map(({ timestamp }) => moment.unix(timestamp).local().format('MM/DD'))
      );
      info.push(...countAlarm.map(({ info }) => info));
      warn.push(...countAlarm.map(({ warn }) => warn));
      danger.push(...countAlarm.map(({ critical }) => critical));
    }
    return {
      title: {
        text: data.length === 0 ? '暂无数据' : '',
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
          name: '次要',
          data: info,
          color: ColorInfo
        },
        {
          type: 'bar',
          name: '重要',
          data: warn,
          color: ColorWarn
        },
        {
          type: 'bar',
          name: '紧急',
          data: danger,
          color: ColorDanger
        }
      ]
    };
  };

  if (loading) return <Spin />;
  return <ChartContainer title={title} options={generateOptions(countAlarm) as any}/>;
};
