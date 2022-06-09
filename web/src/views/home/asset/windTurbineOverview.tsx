import { Empty, Spin } from 'antd';
import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AssetNavigator } from '../assetNavigator';
import '../home.css';
import { MeasurementIcon } from '../measurement/icon';
import { OverviewPage } from '../overviewPage';
import { Introduction, NameValue } from '../props';
import { generateFlangeChartOptions } from '../utils';
import { AssetTypes } from '../constants';
import { getAsset } from './services';
import { AssetRow, transformAssetStatistics } from './props';
import { MeasurementRow } from '../measurement/props';

const WindTurbineOverview: React.FC = () => {
  const { search } = useLocation();
  const id = Number(search.substring(search.lastIndexOf('id=') + 3));
  const [asset, setAsset] = React.useState<AssetRow>();
  const [loading, setLoading] = React.useState(true);
  const [statistics, setStatistics] = React.useState<NameValue[]>();
  const [flanges, setFlanges] = React.useState<Introduction[]>();
  React.useEffect(() => {
    getAsset(id).then((asset) => {
      setLoading(false);
      setAsset(asset);
    });
  }, [id]);
  React.useEffect(() => {
    if (asset) {
      const { children, statistics } = asset;
      setStatistics(
        transformAssetStatistics(
          statistics,
          'monitoringPointNum',
          ['danger', '紧急报警监测点'],
          ['warn', '重要报警监测点'],
          ['info', '次要报警监测点'],
          'deviceNum',
          'offlineDeviceNum'
        ).statistics
      );
      const measurements: MeasurementRow[] = [];
      if (children && children.length > 0) {
        const items = children
          .sort((prev, next) => {
            const { index: prevIndex } = prev.attributes || { index: 5, type: 4 };
            const { index: nextIndex } = next.attributes || { index: 5, type: 4 };
            return prevIndex - nextIndex;
          })
          .sort((prev, next) => {
            const { type: prevType } = prev.attributes || { index: 5, type: 4 };
            const { type: nextType } = next.attributes || { index: 5, type: 4 };
            return prevType - nextType;
          })
          .map((item) => {
            let chart: any = null;
            if (item.monitoringPoints && item.monitoringPoints.length > 0) {
              chart = {
                title: '',
                options: generateFlangeChartOptions(item.monitoringPoints, {
                  inner: '50%',
                  outer: '65%'
                }),
                style: { left: '-24px', top: '-20px', height: 400 }
              };
              measurements.push(
                ...item.monitoringPoints.map((point) => ({ ...point, assetName: item.name }))
              );
            }
            const { alarmState, statistics } = transformAssetStatistics(
              item.statistics,
              'monitoringPointNum',
              ['anomalous', '异常监测点']
            );
            return {
              parentId: item.parentId,
              id: item.id,
              title: {
                name: item.name,
                path: `${AssetTypes.Flange.url}&id=${item.id}`
              },
              alarmState,
              icon: { svg: <MeasurementIcon />, small: true, focus: true },
              statistics,
              chart
            };
          });
        setFlanges(items);
      }
    }
  }, [asset]);

  if (loading) return <Spin />;
  if (!flanges || flanges.length === 0)
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
      <AssetNavigator id={id} type={asset?.type} />
      <OverviewPage {...{ statistics, introductionList: flanges }} />
    </>
  );
};

export default WindTurbineOverview;
