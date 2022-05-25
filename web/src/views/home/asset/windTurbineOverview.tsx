import { Empty, Spin } from 'antd';
import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import MyBreadcrumb from '../../../components/myBreadcrumb';
import '../home.css';
import { MeasurementIcon } from '../measurement/icon';
import { getMeasurements } from '../measurement/services';
import { OverviewPage } from '../overviewPage';
import { Introduction } from '../props';
import { generateFlangeChartOptions } from '../utils';
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
  }, [id, search]);

  React.useEffect(() => {
    if (flanges.items.length > 0) {
      flanges.items.forEach((flange) => {
        if (!flange.chart) {
          getMeasurements().then((measurements) => {
            const children = measurements.filter((mea) => mea.assetId === flange.id);
            const statisticOfFlange: any = generateFlangeChartOptions(children, {
              inner: '45%',
              outer: '60%'
            });
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
