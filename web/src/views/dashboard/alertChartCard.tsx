import ShadowCard from '../../components/shadowCard';
import { Typography } from 'antd';
import { useEffect, useState } from 'react';
import { GetAlarmRecordStatisticsRequest } from '../../apis/alarm';
import { AlarmLevelCritical, AlarmLevelInfo, AlarmLevelWarn } from '../../constants/rule';
import { ColorDanger, ColorInfo, ColorWarn } from '../../constants/color';
import { DefaultMultiBarOption } from '../../constants/chart';
import moment from 'moment';
import EChartsReact from 'echarts-for-react';

const { Title } = Typography;

const AlertChartCard = () => {
  const [option, setOption] = useState<any>();
  const [beginTime] = useState(moment().local().subtract(7, 'd').startOf('day'));
  const [endTime] = useState(moment().local().endOf('day'));

  useEffect(() => {
    GetAlarmRecordStatisticsRequest(beginTime.unix(), endTime.unix(), {}).then((data) => {
      const { info, warn, critical, time } = data;
      const series = [
        { name: AlarmLevelInfo, type: 'bar', data: info, color: ColorInfo },
        { name: AlarmLevelWarn, type: 'bar', data: warn, color: ColorWarn },
        { name: AlarmLevelCritical, type: 'bar', data: critical, color: ColorDanger }
      ];
      setOption({
        ...DefaultMultiBarOption,
        xAxis: {
          ...DefaultMultiBarOption.xAxis,
          data: time.map((item) => moment.unix(item).local().format('MM/DD'))
        },
        series: series
      });
    });
  }, []);

  return (
    <ShadowCard style={{ margin: 4 }}>
      <Title level={4}>一周报警统计</Title>
      {option && <EChartsReact option={option} style={{ height: '212px' }} />}
    </ShadowCard>
  );
};

export default AlertChartCard;
