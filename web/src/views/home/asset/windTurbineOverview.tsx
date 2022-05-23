import { Empty, Spin } from 'antd';
import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import MyBreadcrumb from '../../../components/myBreadcrumb';
import '../home.css';
import { MeasurementIcon } from '../measurement/icon';
import { getMeasurements } from '../measurement/services';
import { OverviewPage } from '../overviewPage';
import { Introduction } from '../props';
import { AssetTypes } from './constants';
import { getAssets } from './services';

const WindTurbineOverview: React.FC = () => {
  const { search } = useLocation();
  const id = Number(search.substring(search.lastIndexOf('id=') + 3));
  const [properties, setProperties] = React.useState([
    { name: '监测点数量', value: 40 },
    { name: '紧急报警监测点数量', value: 0 },
    { name: '重要报警监测点数量', value: 0 },
    { name: '次要报警监测点数量', value: 0 },
    { name: '传感器数量', value: 40 },
    { name: '离线传感器数量', value: 0 }
  ]);
  const [flanges, setFlanges] = React.useState<{
    loading: boolean;
    items: Introduction[];
  }>({
    loading: true,
    items: []
  });
  React.useEffect(() => {
    getAssets({ parent_id: id, type: AssetTypes.Flange.type }).then((assets) => {
      setFlanges({
        loading: false,
        items: assets.map((item) => ({
          parentId: item.parentId,
          id: item.id,
          title: {
            name: item.name,
            path: `/project-overview${search}/flange-overview&id=${item.id}`
          },
          alarmState: 'normal',
          icon: { svg: <MeasurementIcon />, small: true, focus: true },
          properties: [
            { name: '监测点', value: 8 },
            { name: '异常监测点', value: 0 },
            { name: '最大预紧力', value: '345kN' },
            { name: '最小预紧力', value: '310kN' }
          ]
        }))
      });
    });
  }, [id]);

  React.useEffect(() => {
    if (flanges.items.length > 0) {
      flanges.items.forEach((flange) => {
        if (!flange.chart) {
          getMeasurements().then((measurements) => {
            const children = measurements.filter((mea) => mea.assetId === flange.id);
            const statisticOfFlange: any = getStatisticOfFlange(8);
            if (8 > 0) {
              setTimeout(() => {
                setFlanges((prev) => ({
                  ...prev,
                  items: prev.items.map((item) => {
                    if (item.id === flange.id) {
                      return {
                        ...item,
                        chart: {
                          title: '',
                          options: statisticOfFlange,
                          style: { left: '-24px', top: '-20px' }
                        }
                      };
                    } else {
                      return item;
                    }
                  })
                }));
              }, 500);
            }
          });
        }
      });
    }
  }, [flanges]);

  const getStatisticOfFlange = (boltNumberPerFlange: number) => {
    const interval = 360 / boltNumberPerFlange;
    const max = 600;
    const valuesReal = [];
    const valuesRealMax = [];
    const valuesBg = [];
    for (let index = boltNumberPerFlange; index > 0; index--) {
      valuesReal.push(300 + Math.random() * index * 35);
      valuesRealMax.push({ name: index, max });
      valuesBg.push([800, interval * index]);
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

    const count = 360;
    for (let index = count; index > 0; index = index - 3) {
      valuesRule.push([320, (360 / count) * index]);
    }
    return {
      polar: [
        { id: 'inner', radius: '45%' },
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
          startAngle: 360 / boltNumberPerFlange + 90,
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
          type: 'value',
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: false },
          splitLine: { show: false },
          min: 1,
          max: 801
        }
      ],
      radar: {
        radius: '50%',
        indicator: valuesRealMax,
        axisName: { show: false },
        axisLine: { show: false },
        splitLine: { show: false },
        splitArea: { show: false }
      },
      legend: {
        data: [
          {
            name: '实际值',
            icon: 'circle'
          },
          {
            name: '规定值'
          }
        ],
        bottom: 0
      },
      series: [
        {
          type: 'radar',
          name: '实际值',
          lineStyle: { color: '#00800080' },
          itemStyle: { color: '#00800080' },
          data: [{ value: valuesReal }]
        },
        {
          type: 'line',
          name: '规定值',
          coordinateSystem: 'polar',
          data: valuesRule,
          symbol: 'none',
          itemStyle: { color: 'rgb(255, 68, 0, .6)' },
          lineStyle: { type: 'dashed', color: 'rgb(255, 68, 0, .6)' }
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
          },
          zlevel: 10
        }
      ]
    };
  };

  if (flanges.loading) return <Spin />;
  if (flanges.items.length === 0)
    return (
      <Empty
        description={
          <p>
            还没有法兰, 去<Link to='/asset-management?locale=asset-management'>创建</Link>, 或
            <Link to={`/project-overview?locale=project-overview`}>返回</Link>
          </p>
        }
      />
    );
  return (
    <>
      <MyBreadcrumb />
      <OverviewPage {...{ properties, introductionList: flanges.items }} />
    </>
  );
};

export default WindTurbineOverview;
