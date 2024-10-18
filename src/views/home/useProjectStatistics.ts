import * as React from 'react';
import intl from 'react-intl-universal';
import { generateColProps } from '../../utils/grid';
import { ChartOptions } from '../../components/charts/common';
import { Series_Pie } from '../../components/charts/pie';
import { ColorHealth, ColorOffline } from '../../constants/color';
import { isMobile } from '../../utils/deviceDetection';
import {
  generateProjectAlarmStatis,
  getProjectStatistics,
  MONITORING_POINT
} from '../asset-common';

export function useProjectStatistics(rootAssetLabel: string) {
  const [statisticOfAsset, setStatisticOfAsset] = React.useState<ChartOptions<Series_Pie>>();
  const [statisticOfMeasurement, setStatisticOfMeasurement] =
    React.useState<ChartOptions<Series_Pie>>();
  const [statisticOfSensor, setStatisticOfSensor] = React.useState<ChartOptions<Series_Pie>>();

  React.useEffect(() => {
    getProjectStatistics().then(
      ({
        rootAssetNum,
        rootAssetAlarmNum,
        deviceNum,
        deviceOfflineNum,
        monitoringPointNum,
        monitoringPointAlarmNum
      }) => {
        setStatisticOfAsset(
          generatePieOptions(
            intl.get('TOTAL_WITH_NUMBER', { number: rootAssetNum }),
            generateProjectAlarmStatis(rootAssetNum, rootAssetAlarmNum).map((s) => ({
              ...s,
              name: intl.get(s.name)
            }))
          )
        );
        setStatisticOfMeasurement(
          generatePieOptions(
            intl.get('TOTAL_WITH_NUMBER', { number: monitoringPointNum }),
            generateProjectAlarmStatis(monitoringPointNum, monitoringPointAlarmNum).map((s) => ({
              ...s,
              name: intl.get(s.name)
            }))
          )
        );
        setStatisticOfSensor(
          generatePieOptions(intl.get('TOTAL_WITH_NUMBER', { number: deviceNum }), [
            {
              name: intl.get('ONLINE'),
              value: deviceNum - deviceOfflineNum,
              itemStyle: { color: ColorHealth }
            },
            {
              name: intl.get('OFFLINE'),
              value: deviceOfflineNum,
              itemStyle: { color: ColorOffline }
            }
          ])
        );
      }
    );
  }, []);

  const colProps = generateColProps({ xl: 8, xxl: 5 });

  return [
    { colProps, options: statisticOfAsset, title: intl.get(rootAssetLabel) },
    { colProps, options: statisticOfMeasurement, title: intl.get(MONITORING_POINT) },
    { colProps, options: statisticOfSensor, title: intl.get('SENSOR') }
  ];
}

const generatePieOptions = (
  title: string,
  data: { name: string; value: string | number; itemStyle: { color: string } }[]
): ChartOptions<Series_Pie> => {
  return {
    title: {
      text: title,
      left: 'center',
      top: 125
    },
    legend: {
      bottom: 20,
      itemWidth: 15,
      itemHeight: 14,
      itemGap: 5,
      left: isMobile ? '25%' : '30%',
      formatter: (itemName: string) => {
        const series = data.find(({ name }) => itemName === name);
        return series ? `${itemName} {value|${series.value}}` : itemName;
      },
      width: '60%',
      textStyle: {
        rich: {
          value: {
            display: 'inline-block',
            backgroundColor: '#fff',
            width: 30
          }
        }
      }
    },
    series: [
      {
        type: 'pie',
        name: '',
        radius: ['45%', '55%'],
        center: ['50%', '45%'],
        label: { show: false, formatter: '{b} {c}' },
        data
      }
    ]
  };
};
