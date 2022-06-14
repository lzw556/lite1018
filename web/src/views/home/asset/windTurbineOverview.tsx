import { Empty, Spin } from 'antd';
import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AssetNavigator } from '../components/assetNavigator';
import '../home.css';
import { MeasurementIcon } from '../measurement/icon';
import { combineFinalUrl, generateColProps } from '../common/utils';
import { AssetTypes } from '../common/constants';
import { getAsset } from './services';
import { AssetRow } from './props';
import { MeasurementRow } from '../measurement/props';
import { Introduction } from '../components/introductionPage';
import { OverviewPage } from '../components/overviewPage';
import { getAssetStatistics, NameValue } from '../common/statisticsHelper';
import { generateChartOptionsOfLastestData } from '../common/historyDataHelper';

const WindTurbineOverview: React.FC = () => {
  const { pathname, search } = useLocation();
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
        getAssetStatistics(
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
                options: generateChartOptionsOfLastestData(item.monitoringPoints, {
                  inner: '50%',
                  outer: '65%'
                }),
                style: { left: '-24px', top: '-20px', height: 400 }
              };
              measurements.push(
                ...item.monitoringPoints.map((point) => ({ ...point, assetName: item.name }))
              );
            }
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
                path: combineFinalUrl(pathname, search, AssetTypes.Flange.url, item.id)
              },
              alarmState,
              icon: { svg: <MeasurementIcon />, small: true, focus: true },
              statistics,
              chart,
              colProps: generateColProps({ md: 12, lg: 12, xl: 12, xxl: 8 }),
              statisticsLayout: 'horizontal'
            };
          });
        if (measurements.length > 0){
          setFlanges(items);
        }else{
          setFlanges(undefined);
        }
      }
    }
  }, [asset, pathname, search]);

  if (loading) return <Spin />;
  if (!asset || !asset.children || asset.children.length === 0 || !flanges || flanges.length === 0)
    return (
      <Empty
        description={
          <p>
            还没有法兰或监测点, 去<Link to='/asset-management?locale=asset-management'>创建</Link>, 或
            <Link to={`/project-overview?locale=project-overview`}>返回</Link>
          </p>
        }
      />
    );
  return (
    <>
      {asset && <AssetNavigator id={asset.id} parentId={asset.parentId} />}
      <OverviewPage {...{ statistics, introductionList: flanges }} />
    </>
  );
};

export default WindTurbineOverview;
