import { Empty, Spin } from 'antd';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { AssetTypes } from './constants';
import { AssetIcon } from './asset/icon';
import { getAssets, getProjectStatistics } from './asset/services';
import { Series_Bar } from './charts/bar';
import { ChartOptions } from './charts/common';
import { Series_Pie } from './charts/pie';
import './home.css';
import { OverviewPage } from './overviewPage';
import { Introduction } from './props';
import { generateColProps } from './utils';
import { generateProjectAlarmStatis, transformAssetStatistics } from './asset/props';
import { ColorHealth, ColorOffline } from '../../constants/color';

const ProjectOverview: React.FC = () => {
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
  const [statisticOfAlarm, setStatisticOfAlarm] = React.useState<ChartOptions<Series_Bar>>();
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
          const { alarmState, statistics } = transformAssetStatistics(
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
              path: `${AssetTypes.WindTurbind.url}&id=${item.id}`
            },
            alarmState,
            icon: { svg: <AssetIcon />, small: true },
            statistics
          };
        })
      })
    );
    // setStatisticOfAlarm({
    //   title: {
    //     text: '',
    //     left: 'center'
    //   },
    //   legend: {
    //     bottom: 20,
    //     data: [
    //       { name: '次要', itemStyle: { color: ColorInfo } },
    //       { name: '重要', itemStyle: { color: ColorWarn } },
    //       { name: '紧急', itemStyle: { color: ColorDanger } }
    //     ]
    //   },
    //   tooltip: { trigger: 'axis' },
    //   xAxis: {
    //     type: 'category',
    //     data: []
    //   },
    //   yAxis: { type: 'value', minInterval: 1 },
    //   series: [
    //     {
    //       type: 'bar',
    //       name: '次要',
    //       data: []
    //     },
    //     {
    //       type: 'bar',
    //       name: '重要',
    //       data: []
    //     },
    //     {
    //       type: 'bar',
    //       name: '紧急',
    //       data: []
    //     }
    //   ]
    // });
  }, []);

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
      legend: { bottom: 20 },
      series: [
        {
          type: 'pie',
          name: 'hehe',
          radius: ['40%', '50%'],
          center: ['50%', '50%'],
          label: { formatter: '{b} {c}' },
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
      />
    );

  return (
    <OverviewPage
      {...{
        chartList: [
          { title: '风机', colProps, options: statisticOfAsset },
          { title: '监测点', colProps, options: statisticOfMeasurement },
          { title: '传感器', colProps, options: statisticOfSensor },
          { title: '报警趋势', colProps: colProps2, options: statisticOfAlarm }
        ],
        introductionList: windTurbines.items
      }}
    />
  );
};

export default ProjectOverview;
