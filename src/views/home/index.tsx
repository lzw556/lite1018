import { Empty, Spin } from 'antd';
import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { WindTurbineIcon } from './summary/windTurbine/icon';
import { getAssets, getProjectStatistics } from './assetList/services';
import { ChartOptions } from './components/charts/common';
import { Series_Pie } from './components/charts/pie';
import './home.css';
import { generateColProps, combineFinalUrl } from './common/utils';
import { ColorHealth, ColorOffline } from '../../constants/color';
import { Introduction } from './components/introductionPage';
import { OverviewPage } from './components/overviewPage';
import { generateProjectAlarmStatis, getAssetStatistics } from './common/statisticsHelper';
import { AlarmStatisticOfProject } from './AlarmStatisticOfProject';
import { isMobile } from '../../utils/deviceDetection';
import * as AppConfig from '../../config';

export type ProjectStatistics = {
  deviceOfflineNum: number;
  deviceNum: number;
  monitoringPointAlarmNum: [number, number, number];
  monitoringPointNum: number;
  rootAssetAlarmNum: [number, number, number];
  rootAssetNum: number;
};
const ProjectOverview: React.FC = () => {
  const { pathname, search } = useLocation();
  const colProps = generateColProps({ xl: 8, xxl: 5 });
  const colProps2 = generateColProps({ xl: 24, xxl: 9 });
  const [windTurbines, setWindTurbines] = React.useState<{
    loading: boolean;
    items: Introduction[];
  }>({
    loading: true,
    items: []
  });
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
    getAssets({ type: AppConfig.use(window.assetCategory).assetType.id }).then((assets) =>
      setWindTurbines({
        loading: false,
        items: assets
          .filter((asset) => asset.parentId === 0)
          .map((item) => {
            const { alarmState, statistics } = getAssetStatistics(
              item.statistics,
              'monitoringPointNum',
              ['anomalous', '异常监测点'],
              'deviceNum',
              'offlineDeviceNum'
            );
            return {
              parentId: item.parentId,
              id: item.id,
              title: {
                name: item.name,
                path: combineFinalUrl(
                  pathname,
                  search,
                  AppConfig.use(window.assetCategory).assetType.url,
                  item.id
                )
              },
              alarmState,
              icon: { svg: <WindTurbineIcon />, small: true },
              statistics
            };
          })
      })
    );
  }, [pathname, search]);

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
              // color: '#fff',
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

  if (windTurbines.loading) return <Spin />;
  if (windTurbines.items.length === 0)
    return (
      <Empty
        description={
          <p>
            还没有{AppConfig.use(window.assetCategory).assetType.label}, 去
            <Link to='/asset-management'>创建</Link>
          </p>
        }
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );

  return (
    <OverviewPage
      {...{
        chartList: [
          {
            title: AppConfig.use(window.assetCategory).assetType.label,
            colProps,
            options: statisticOfAsset
          },
          { title: '监测点', colProps, options: statisticOfMeasurement },
          { title: '传感器', colProps, options: statisticOfSensor },
          { colProps: colProps2, render: <AlarmStatisticOfProject title='报警趋势' /> }
        ],
        introductionList: windTurbines.items
      }}
    />
  );
};

export default ProjectOverview;
