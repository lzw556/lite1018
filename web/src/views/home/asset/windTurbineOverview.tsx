import { Empty, Spin } from 'antd';
import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import MyBreadcrumb from '../../../components/myBreadcrumb';
import '../home.css';
import { MeasurementIcon } from '../measurement/icon';
import { getMeasurements } from '../measurement/services';
import { OverviewPage } from '../overviewPage';
import { Introduction } from '../props';
import { filterAssets } from './props';
import { getAssets } from './services';

const WindTurbineOverview: React.FC = () => {
  const { search } = useLocation();
  const id = Number(search.substring(search.lastIndexOf('id=') + 3));
  const [properties, setProperties] = React.useState([
    { name: '监测螺栓数量', value: 4 },
    { name: '异常螺栓数量', value: 4 },
    { name: '最大预紧力', value: '400kN' },
    { name: '最新预紧力', value: '300kN' }
  ]);
  const [flanges, setFlanges] = React.useState<{
    loading: boolean;
    items: Introduction[];
  }>({
    loading: true,
    items: []
  });
  React.useEffect(() => {
    getAssets().then((assets) => {
      setFlanges({
        loading: false,
        items: filterAssets(assets, 'Flange', id).map((item) => ({
          parentId: item.ParentID,
          id: item.ID,
          title: {
            name: item.Name,
            path: `/project-overview?locale=project-overview/wind-overview&id=${item.ParentID}/flange-overview&id=${item.ID}`
          },
          alarmState: 'normal',
          icon: { svg: <MeasurementIcon />, small: true, focus: true },
          properties: [
            { name: '监测点', value: 1 },
            { name: '异常监测点', value: 5 },
            { name: '螺栓监测', value: '正常' },
            { name: '报警', value: 3 }
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
            const statisticOfFlange: any = getStatisticOfFlange(children.length);
            if (children.length > 0) {
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
      valuesReal.push(300 + Math.random() * 20);
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
      valuesRule.push([max, (360 / count) * index]);
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
          type: 'radar',
          name: '实际值',
          data: [{ value: valuesReal }]
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
            还没有法兰, 去<Link to='/asset-management?locale=asset-management'>创建</Link>, 或{' '}
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
