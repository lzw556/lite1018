import { Empty, Spin } from 'antd';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { ColorDanger, ColorHealth, ColorInfo, ColorWarn } from '../../constants/color';
import { AssetTypes } from './asset/constants';
import { AssetIcon } from './asset/icon';
import { getAssets } from './asset/services';
import { Series_Bar } from './charts/bar';
import { ChartOptions } from './charts/common';
import { Series_Pie } from './charts/pie';
import './home.css';
import { OverviewPage } from './overviewPage';
import { Introduction } from './props';

const ProjectOverview: React.FC = () => {
  const [windTurbines, setWindTurbines] = React.useState<{
    loading: boolean;
    items: Introduction[];
  }>({
    loading: true,
    items: []
  });
  React.useEffect(() => {
    getAssets({ type: AssetTypes.WindTurbind.type }).then((assets) =>
      setWindTurbines({
        loading: false,
        items: assets.map((item) => ({
          parentId: item.parentId,
          id: item.id,
          title: {
            name: item.name,
            path: `/project-overview?locale=project-overview/wind-overview&id=${item.id}`
          },
          alarmState: 'normal',
          icon: { svg: <AssetIcon />, small: true },
          properties: [
            { name: '监测点', value: 40 },
            { name: '异常监测点', value: 0 },
            { name: '螺栓监测', value: '正常' },
            { name: '离线', value: 0 }
          ]
        }))
      })
    );
  }, []);
  const colProps = {
    xs: { span: 24 },
    sm: { span: 24 },
    md: { span: 24 },
    xl: { span: 8 },
    xxl: { span: 5 }
  };
  const colProps2 = {
    xs: { span: 24 },
    sm: { span: 24 },
    md: { span: 24 },
    xl: { span: 24 },
    xxl: { span: 9 }
  };
  const statisticOfAsset: ChartOptions<Series_Pie> = {
    title: {
      text: '共12台',
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
        data: [
          { name: '正常', value: 11, itemStyle: { color: ColorHealth } },
          { name: '异常', value: 1, itemStyle: { color: '#ccc' } }
        ]
      }
    ]
  };
  const statisticOfMeasurement: ChartOptions<Series_Pie> = {
    title: {
      text: '共480个',
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
        data: [
          { name: '正常', value: 472, itemStyle: { color: ColorHealth } },
          { name: '异常', value: 8, itemStyle: { color: '#ccc' } }
        ]
      }
    ]
  };
  const statisticOfSensor: ChartOptions<Series_Pie> = {
    title: {
      text: '共480个',
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
        data: [
          { name: '正常', value: 472, itemStyle: { color: ColorHealth } },
          { name: '异常', value: 8, itemStyle: { color: '#ccc' } }
        ]
      }
    ]
  };
  const statisticOfAlarm: ChartOptions<Series_Bar> = {
    title: {
      text: '',
      left: 'center'
    },
    legend: {
      bottom: 20,
      data: [
        { name: '次要', itemStyle: { color: ColorInfo } },
        { name: '重要', itemStyle: { color: ColorWarn } },
        { name: '紧急', itemStyle: { color: ColorDanger } }
      ]
    },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: [
        '2022-04-08',
        '2022-04-09',
        '2022-04-10',
        '2022-04-11',
        '2022-04-12',
        '2022-04-13',
        '2022-04-14'
      ]
    },
    yAxis: { type: 'value', minInterval: 1 },
    series: [
      {
        type: 'bar',
        name: '次要',
        data: [
          { name: 'info', value: 0, itemStyle: { color: ColorInfo } },
          { name: 'info', value: 0, itemStyle: { color: ColorInfo } },
          { name: 'info', value: 0, itemStyle: { color: ColorInfo } },
          { name: 'info', value: 0, itemStyle: { color: ColorInfo } },
          { name: 'info', value: 0, itemStyle: { color: ColorInfo } },
          { name: 'info', value: 0, itemStyle: { color: ColorInfo } },
          { name: 'info', value: 0, itemStyle: { color: ColorInfo } }
        ]
      },
      {
        type: 'bar',
        name: '重要',
        data: [
          { name: 'warn', value: 0, itemStyle: { color: ColorWarn } },
          { name: 'warn', value: 0, itemStyle: { color: ColorWarn } },
          { name: 'warn', value: 0, itemStyle: { color: ColorWarn } },
          { name: 'warn', value: 2, itemStyle: { color: ColorWarn } },
          { name: 'warn', value: 0, itemStyle: { color: ColorWarn } },
          { name: 'warn', value: 0, itemStyle: { color: ColorWarn } },
          { name: 'warn', value: 0, itemStyle: { color: ColorWarn } }
        ]
      },
      {
        type: 'bar',
        name: '紧急',
        data: [
          { name: 'danger', value: 0, itemStyle: { color: ColorDanger } },
          { name: 'danger', value: 0, itemStyle: { color: ColorDanger } },
          { name: 'danger', value: 0, itemStyle: { color: ColorDanger } },
          { name: 'danger', value: 0, itemStyle: { color: ColorDanger } },
          { name: 'danger', value: 0, itemStyle: { color: ColorDanger } },
          { name: 'danger', value: 0, itemStyle: { color: ColorDanger } },
          { name: 'danger', value: 0, itemStyle: { color: ColorDanger } }
        ]
      }
    ]
  };
  const [chartList, setChartList] = React.useState([
    { title: '风机', colProps, options: statisticOfAsset },
    { title: '监测点', colProps, options: statisticOfMeasurement },
    { title: '传感器', colProps, options: statisticOfSensor },
    { title: '报警趋势', colProps: colProps2, options: statisticOfAlarm }
  ]);

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

  return <OverviewPage {...{ chartList, introductionList: windTurbines.items }} />;
};

export default ProjectOverview;
