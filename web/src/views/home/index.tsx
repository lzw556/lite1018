import { Empty, Spin } from 'antd';
import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AssetTypes } from './common/constants';
import { AssetIcon } from './asset/icon';
import { getAssets, getProjectStatistics } from './asset/services';
import { ChartOptions } from './components/charts/common';
import { Series_Pie } from './components/charts/pie';
import './home.css';
import { generateColProps, combineFinalUrl } from './common/utils';
import { ColorHealth, ColorOffline } from '../../constants/color';
import { Introduction } from './components/introductionPage';
import { OverviewPage } from './components/overviewPage';
import { generateProjectAlarmStatis, getAssetStatistics } from './common/statisticsHelper';
import { AlarmStatisticOfProject } from './AlarmStatisticOfProject';

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
    getAssets({ type: AssetTypes.WindTurbind.id }).then((assets) =>
      setWindTurbines({
        loading: false,
        items: assets.map((item) => {
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
              path: combineFinalUrl(pathname, search, AssetTypes.WindTurbind.url, item.id)
            },
            alarmState,
            icon: { svg: <AssetIcon />, small: true },
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
        top: 'center'
      },
      legend: {
        bottom: 20,
        itemWidth: 15,
        itemHeight: 14,
        itemGap: 15,
        formatter: (itemName: string) => {
          const series = data.find(({ name }) => itemName === name);
          return series ? `${itemName} ${series.value}` : itemName;
        },
        width: '50%'
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
            还没有风机, 去<Link to='/asset-management?locale=asset-management'>创建</Link>
          </p>
        }
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );

  return (
    <OverviewPage
      {...{
        chartList: [
          { title: '风机', colProps, options: statisticOfAsset },
          { title: '监测点', colProps, options: statisticOfMeasurement },
          { title: '传感器', colProps, options: statisticOfSensor },
          { colProps: colProps2, render: <AlarmStatisticOfProject title='报警趋势'/> }
        ],
        introductionList: windTurbines.items
      }}
    />
  );
};

export default ProjectOverview;
