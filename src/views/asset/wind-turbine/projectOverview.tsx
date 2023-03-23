import { Empty } from 'antd';
import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { WindTurbineIcon } from './icon/icon';
import { getProjectStatistics } from '../services';
import { ChartOptions } from '../../../components/charts/common';
import { Series_Pie } from '../../../components/charts/pie';
import { OverviewPage } from '../components/overviewPage';
import { generateProjectAlarmStatis, getAssetStatistics } from '../common/statisticsHelper';
import { Introduction } from '../components/introduction';
import { NO_WIND_TURBINES, WIND_TURBINE } from './config';
import { AlarmTrend } from './alarmTrend';
import { useAssetsContext } from '../components/assetsContext';
import { ASSET_CATEGORY, useAssetCategoryContext } from '../components/assetCategoryContext';
import { generateColProps } from '../../../utils/grid';
import { ColorHealth, ColorOffline } from '../../../constants/color';
import { isMobile } from '../../../utils/deviceDetection';
import { INVALID_MONITORING_POINT, MONITORING_POINT } from '../../monitoring-point';
import { NameValueGroups } from '../../../components/name-values';
import { rootPathState } from '../components';
import intl from 'react-intl-universal';

export type ProjectStatistics = {
  deviceOfflineNum: number;
  deviceNum: number;
  monitoringPointAlarmNum: [number, number, number];
  monitoringPointNum: number;
  rootAssetAlarmNum: [number, number, number];
  rootAssetNum: number;
};

export default function ProjectOverview() {
  const { state } = useLocation();
  const { assets } = useAssetsContext();
  const category = useAssetCategoryContext();
  const colProps = generateColProps({ xl: 8, xxl: 5 });
  const colProps2 = generateColProps({ xl: 24, xxl: 9 });
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
            generateProjectAlarmStatis(rootAssetNum, rootAssetAlarmNum)
          )
        );
        setStatisticOfMeasurement(
          generatePieOptions(
            intl.get('TOTAL_WITH_NUMBER', { number: monitoringPointNum }),
            generateProjectAlarmStatis(monitoringPointNum, monitoringPointAlarmNum)
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

  const winds = assets.filter((a) => a.parentId === 0);
  if (winds.length === 0)
    return (
      <Empty
        description={
          <p>
            {intl.get(NO_WIND_TURBINES)},
            <Link to='/asset-management'>{intl.get('CREATE_ONE')}</Link>
          </p>
        }
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );

  return (
    <OverviewPage
      {...{
        charts: [
          {
            title: intl.get(WIND_TURBINE),
            colProps,
            options: statisticOfAsset
          },
          { title: intl.get(MONITORING_POINT), colProps, options: statisticOfMeasurement },
          { title: intl.get('SENSOR'), colProps, options: statisticOfSensor },
          { colProps: colProps2, render: <AlarmTrend title={intl.get('ALARM_TREND')} /> }
        ],
        introductions: winds.map((item) => {
          const { alarmState, statistics } = getAssetStatistics(
            item.statistics,
            ['monitoringPointNum', intl.get('MONITORING_POINT')],
            ['anomalous', intl.get(INVALID_MONITORING_POINT)],
            ['deviceNum', intl.get('DEVICE')],
            ['offlineDeviceNum', intl.get('OFFLINE_DEVICE')]
          );
          return (
            <Introduction
              {...{
                count: <NameValueGroups items={statistics} />,
                title: {
                  name: item.name,
                  path: `/${ASSET_CATEGORY[category]}/${item.id}`,
                  state: state ?? rootPathState
                },
                alarmState,
                icon: { svg: <WindTurbineIcon />, small: true }
              }}
            />
          );
        })
      }}
    />
  );
}
