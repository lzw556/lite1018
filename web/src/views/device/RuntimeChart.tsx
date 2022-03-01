import * as React from 'react';
import { Card, Empty } from 'antd';
import moment from 'moment';
import ReactECharts from "echarts-for-react";
import { GetDeviceRuntimeDataRequest } from '../../apis/device';
import { DefaultMonitorDataOption, LineChartStyles } from '../../constants/chart';
import { isMobile } from '../../utils/deviceDetection';

export const RuntimeChart: React.FC<{ deviceId: number }> = ({ deviceId }) => {
  const [runtimeOptions, setRuntimeOptions] = React.useState<any>();

  React.useEffect(() => {
    GetDeviceRuntimeDataRequest(
      deviceId,
      moment().startOf('day').subtract(13, 'd').utc().unix(),
      moment().endOf('day').utc().unix()
    ).then((data) => {
      const batteryOption = {
        ...DefaultMonitorDataOption,
        title: { text: '电池电压' },
        tooltip: {
          trigger: 'axis',
          formatter: '{b}<br/>{a}: {c}mV'
        },
        series: [
          {
            ...LineChartStyles[0],
            name: '电池电压',
            type: 'line',
            data: data.map((item: any) => item.batteryVoltage)
          }
        ],
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: data.map((item: any) =>
            moment.unix(item.timestamp).local().format('YYYY-MM-DD HH:mm:ss')
          )
        }
      };
      const signalOption = {
        ...DefaultMonitorDataOption,
        title: { text: '信号强度' },
        tooltip: {
          trigger: 'axis',
          formatter: '{b}<br/>{a}: {c}dB'
        },
        series: [
          {
            ...LineChartStyles[0],
            name: '信号强度',
            type: 'line',
            data: data.map((item: any) => item.signalStrength)
          }
        ],
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: data.map((item: any) =>
            moment.unix(item.timestamp).local().format('YYYY-MM-DD HH:mm:ss')
          )
        }
      };
      setRuntimeOptions([batteryOption, signalOption]);
    });
  }, [deviceId]);

  if (runtimeOptions && runtimeOptions.length) {
    return runtimeOptions.map((item: any, index: number) => {
      return (
        <Card.Grid key={index} style={{ boxShadow: 'none', border: 'none', width: isMobile ? '100%' : '50%' }}>
          <ReactECharts option={item} style={{ border: 'none', height: '256px' }} />
        </Card.Grid>
      );
    });
  }
  return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'数据不足'} />;
};
