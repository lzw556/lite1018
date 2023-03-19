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
import { NO_WIND_TURBINES, WIND_TURBINE } from './common/types';
import { AlarmTrend } from './alarmTrend';
import { useAssetsContext } from '../components/assetsContext';
import { ASSET_CATEGORY, useAssetCategoryContext } from '../components/assetCategoryContext';
import { generateColProps } from '../../../utils/grid';
import { ColorHealth, ColorOffline } from '../../../constants/color';
import { isMobile } from '../../../utils/deviceDetection';
import { INVALID_MONITORING_POINT, MONITORING_POINT } from '../../monitoring-point';
import { NameValueGroups } from '../../../components/name-values';
import { rootPathState } from '../components';

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
            `共${rootAssetNum}台`,
            generateProjectAlarmStatis(rootAssetNum, rootAssetAlarmNum)
          )
        );
        setStatisticOfMeasurement(
          generatePieOptions(
            `共${monitoringPointNum}个`,
            generateProjectAlarmStatis(monitoringPointNum, monitoringPointAlarmNum)
          )
        );
        setStatisticOfSensor(
          generatePieOptions(`共${deviceNum}个`, [
            {
              name: '在线',
              value: deviceNum - deviceOfflineNum,
              itemStyle: { color: ColorHealth }
            },
            { name: '离线', value: deviceOfflineNum, itemStyle: { color: ColorOffline } }
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
            {NO_WIND_TURBINES}, 去<Link to='/asset-management'>创建</Link>
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
            title: WIND_TURBINE,
            colProps,
            options: statisticOfAsset
          },
          { title: MONITORING_POINT, colProps, options: statisticOfMeasurement },
          { title: '传感器', colProps, options: statisticOfSensor },
          { colProps: colProps2, render: <AlarmTrend title='报警趋势' /> }
        ],
        introductions: winds.map((item) => {
          const { alarmState, statistics } = getAssetStatistics(
            item.statistics,
            'monitoringPointNum',
            ['anomalous', INVALID_MONITORING_POINT],
            'deviceNum',
            'offlineDeviceNum'
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
