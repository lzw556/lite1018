import * as React from 'react';
import { ColorHealth } from '../../constants/color';
import { AssetIcon } from './asset/icon';
import { Series_Bar } from './charts/bar';
import { ChartOptions } from './charts/common';
import { Series_Pie } from './charts/pie';
import './home.css';
import { OverviewPage } from './overviewPage';
import { Introduction, Overview } from './props';

const ProjectOverview: React.FC = () => {
  const [overview, setOverview] = React.useState<Overview>();
  React.useEffect(() => {
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
        text: '一共15',
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
          data: [
            { name: '正常', value: 10, itemStyle: { color: ColorHealth } },
            { name: '异常', value: 5, itemStyle: { color: '#ccc' } }
          ]
        }
      ]
    };
    const statisticOfMeasurement: ChartOptions<Series_Pie> = {
      title: {
        text: '一共15',
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
          data: [
            { name: '正常', value: 10, itemStyle: { color: ColorHealth } },
            { name: '异常', value: 5, itemStyle: { color: '#ccc' } }
          ]
        }
      ]
    };
    const statisticOfSensor: ChartOptions<Series_Pie> = {
      title: {
        text: '一共15',
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
          data: [
            { name: '正常', value: 10, itemStyle: { color: ColorHealth } },
            { name: '异常', value: 5, itemStyle: { color: '#ccc' } }
          ]
        }
      ]
    };
    const statisticOfAlarm: ChartOptions<Series_Bar> = {
      title: {
        text: '',
        left: 'center'
      },
      legend: { bottom: 20 },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['2022-03-08', '2022-03-09', '2022-03-10'] },
      yAxis: { type: 'value' },
      series: [
        {
          type: 'bar',
          name: '严重',
          data: [1, 2, 3]
        },
        {
          type: 'bar',
          name: '次要',
          data: [3, 2, 1]
        }
      ]
    };
    const assets: Introduction[] = [];
    for (let index = 0; index < 12; index++) {
      assets.push({
        parentId: 1,
        id: index,
        title: {
          name: `风机${index + 1}`,
          path: `/project-overview?locale=project-overview/asset-overview&id=${index}`
        },
        alarmState: 'normal',
        icon: { svg: <AssetIcon />, small: true },
        properties: [
          { name: '监测点', value: 1 },
          { name: '异常监测点', value: 5 },
          { name: '螺栓监测', value: '正常' },
          { name: '报警', value: 3 }
        ]
      });
    }
    setOverview({
      chartList: [
        { title: '风机', colProps, options: statisticOfAsset },
        { title: '监测点', colProps, options: statisticOfMeasurement },
        { title: '传感器', colProps, options: statisticOfSensor },
        { title: '报警趋势', colProps: colProps2, options: statisticOfAlarm }
      ],
      introductionList: assets
    });
  }, []);

  if (!overview) return null;

  return <OverviewPage {...overview} />;
};

export default ProjectOverview;
