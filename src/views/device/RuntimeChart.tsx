import * as React from 'react';
import { Card, Empty } from 'antd';
import dayjs from '../../utils/dayjsUtils';
import ReactECharts from 'echarts-for-react';
import { GetDeviceRuntimeRequest } from '../../apis/device';
import { DefaultMonitorDataOption, LineChartStyles } from '../../constants/chart';
import { isMobile } from '../../utils/deviceDetection';
import { DeviceType } from '../../types/device_type';
import intl from 'react-intl-universal';

export const RuntimeChart: React.FC<{ deviceId: number; deviceType: number }> = ({
  deviceId,
  deviceType
}) => {
  const [runtimeOptions, setRuntimeOptions] = React.useState<any>();

  React.useEffect(() => {
    GetDeviceRuntimeRequest(
      deviceId,
      dayjs().startOf('day').subtract(13, 'd').utc().unix(),
      dayjs().endOf('day').utc().unix()
    ).then((data) => {
      const batteryOption = {
        ...DefaultMonitorDataOption,
        title: { text: intl.get('BATTERY_VOLTAGE') },
        tooltip: {
          trigger: 'axis',
          formatter: '{b}<br/>{a}: {c}mV'
        },
        series: [
          {
            ...LineChartStyles[0],
            name: intl.get('BATTERY_VOLTAGE'),
            type: 'line',
            data: data.map((item: any) => item.batteryVoltage)
          }
        ],
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: data.map((item: any) =>
            dayjs.unix(item.timestamp).local().format('YYYY-MM-DD HH:mm:ss')
          )
        }
      };
      const signalOption = {
        ...DefaultMonitorDataOption,
        title: { text: intl.get('SIGNAL_STRENGTH') },
        tooltip: {
          trigger: 'axis',
          formatter: '{b}<br/>{a}: {c}dB'
        },
        series: [
          {
            ...LineChartStyles[0],
            name: intl.get('SIGNAL_STRENGTH'),
            type: 'line',
            data: data.map((item: any) => item.signalStrength)
          }
        ],
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: data.map((item: any) =>
            dayjs.unix(item.timestamp).local().format('YYYY-MM-DD HH:mm:ss')
          )
        }
      };
      if (deviceType !== DeviceType.Gateway) {
        setRuntimeOptions([batteryOption, signalOption]);
      } else {
        setRuntimeOptions([signalOption]);
      }
    });
  }, [deviceId, deviceType]);

  if (runtimeOptions && runtimeOptions.length) {
    return (
      <Card bordered={false}>
        {runtimeOptions.map((item: any, index: number) => {
          return (
            <Card.Grid
              key={index}
              style={{ boxShadow: 'none', border: 'none', width: isMobile ? '100%' : '50%' }}
            >
              <ReactECharts option={item} style={{ border: 'none', height: '256px' }} />
            </Card.Grid>
          );
        })}
      </Card>
    );
  }
  return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={intl.get('NO_DATA_PROMPT')} />;
};
