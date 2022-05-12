import * as React from 'react';
import { useLocation } from 'react-router-dom';
import MyBreadcrumb from '../../../components/myBreadcrumb';
import { ColorHealth } from '../../../constants/color';
import { Series_Bar } from '../charts/bar';
import { ChartOptions } from '../charts/common';
import { Series_Pie } from '../charts/pie';
import '../home.css';
import { MeasurementIcon } from '../measurement/icon';
import { OverviewPage } from '../overviewPage';
import { Introduction, Overview } from '../props';

const AssetOverview: React.FC = () => {
  const { search } = useLocation();
  const id = Number(search.substring(search.lastIndexOf('id=') + 3));
  const [overview, setOverview] = React.useState<Overview>();
  React.useEffect(() => {
    const colProps = {
      xs: { span: 24 },
      sm: { span: 24 },
      md: { span: 24 },
      xl: { span: 8 },
      xxl: { span: 6 }
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
    const statisticOfPreload: ChartOptions<Series_Bar> = {
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
    const getStatisticOfFlange = () => {
      const sensorCountPerFlange = 6;
      const interval = 360 / sensorCountPerFlange;
      const valuesReal = [];
      const valuesBg = [];
      for (let index = sensorCountPerFlange; index >= 0; index--) {
        valuesReal.push([300 + Math.random() * 20, interval * index]);
        valuesBg.push([1, interval * index]);
      }
      const valuesSensor = valuesBg.map((item, index) => ({
        name: `item${index}`,
        value: item,
        label: {
          show: true,
          color: '#fff',
          formatter: (paras: any) => {
            return paras.data.value[1] / interval;
          }
        }
      }));
      const valuesRule = [];
      const max = 600;
      const count = 360;
      for (let index = count; index >= 0; index = index - 3) {
        valuesRule.push([max, (360 / count) * index]);
      }
      return {
        polar: [
          { id: 'inner', radius: '50%' },
          { id: 'outer', radius: '60%' }
        ],
        angleAxis: [
          {
            type: 'value',
            polarIndex: 0,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { show: false },
            splitLine: { show: false }
          },
          {
            type: 'value',
            polarIndex: 1,
            startAngle: 360 / sensorCountPerFlange + 90,
            axisLine: { show: true, lineStyle: { type: 'dashed' } },
            axisTick: { show: false },
            axisLabel: { show: false },
            splitLine: { show: false }
          }
        ],
        radiusAxis: [
          {
            polarIndex: 0,
            max: 700,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: '#ccc' }
          },
          {
            polarIndex: 1,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { show: false },
            splitLine: { show: false }
          }
        ],
        legend: {
          data: [
            {
              name: '实际值'
            },
            {
              name: '规定值'
            }
          ],
          bottom: 0
        },
        series: [
          {
            type: 'line',
            name: '实际值',
            coordinateSystem: 'polar',
            data: valuesReal
          },
          {
            type: 'line',
            name: '规定值',
            coordinateSystem: 'polar',
            data: valuesRule,
            symbol: 'none',
            lineStyle: { type: 'dashed' }
          },
          {
            type: 'scatter',
            name: 'bg',
            coordinateSystem: 'polar',
            polarIndex: 1,
            symbol:
              'path://M675.9 107.2H348.1c-42.9 0-82.5 22.9-104 60.1L80 452.1c-21.4 37.1-21.4 82.7 0 119.8l164.1 284.8c21.4 37.2 61.1 60.1 104 60.1h327.8c42.9 0 82.5-22.9 104-60.1L944 571.9c21.4-37.1 21.4-82.7 0-119.8L779.9 167.3c-21.4-37.1-61.1-60.1-104-60.1z',
            symbolSize: 30,
            data: valuesSensor,
            itemStyle: {
              opacity: 1,
              color: '#555'
            }
          }
        ]
      };
    };
    const statisticOfFlange: any = getStatisticOfFlange();
    const measurements: Introduction[] = [];
    for (let index = 0; index < 5; index++) {
      measurements.push({
        parentId: id,
        id: index,
        title: {
          name: `叶根${index + 1}`,
          path: `/project-overview?locale=project-overview/asset-overview&id=${id}/measurement-overview&id=${index}`
        },
        icon: { svg: <MeasurementIcon />, small: false, focus: true },
        alarmState: 'normal',
        properties: [
          { name: '监测点', value: 1 },
          { name: '异常监测点', value: 5 },
          { name: '螺栓监测', value: '正常' },
          { name: '报警', value: 3 }
        ],
        chart: { title: '', options: statisticOfFlange, style: { left: '-24px', top: '-20px' } }
      });
    }
    setOverview({
      chartList: [
        { title: '监测点', colProps, options: statisticOfMeasurement },
        { title: '传感器', colProps, options: statisticOfSensor },
        { title: '报警趋势', colProps, options: statisticOfAlarm },
        { title: '预紧力趋势', colProps, options: statisticOfPreload }
      ],
      introductionList: measurements
    });
  }, [id]);

  if (!overview) return null;

  return (
    <>
      <MyBreadcrumb />
      <OverviewPage {...overview} />
    </>
  );
};

export default AssetOverview;
