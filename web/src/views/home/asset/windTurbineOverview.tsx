import { Empty, Spin } from 'antd';
import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AssetNavigator } from '../assetNavigator';
import '../home.css';
import { MeasurementIcon } from '../measurement/icon';
import { OverviewPage } from '../overviewPage';
import { Introduction, NameValue, TableListItem } from '../props';
import { generateColProps, generateFlangeChartOptions, generatePropertyColumns } from '../utils';
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
  const [table, setTable] = React.useState<TableListItem<any>>({
    rowKey: 'id',
    columns: [
      {
        title: '法兰',
        dataIndex: 'assetName',
        key: 'assetName',
        width: 200
      },
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
        width: 200
      },
      {
        title: '状态',
        key: 'alarmState',
        render: (val: any, record: MeasurementRow) => '',
        width: 120
      }
    ],
    colProps: generateColProps({ xl: 24, xxl: 24 }),
    size: 'small',
    pagination: false
  });
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
        const items = children.map((item) => {
          let chart: any = null;
          if (item.monitoringPoints && item.monitoringPoints.length > 0) {
            chart = {
              title: '',
              options: generateFlangeChartOptions(item.monitoringPoints, {
                inner: '45%',
                outer: '60%'
              }),
              style: { left: '-24px', top: '-20px' }
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
      if (measurements.length)
        setTable((prev) => {
          if (prev.columns) {
            return {
              ...prev,
              columns: [...prev.columns, ...generatePropertyColumns(measurements[0])],
              dataSource: measurements
            };
          } else {
            return prev;
          }
        });
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
      <OverviewPage {...{ statistics, introductionList: flanges, tabelList: [table] }} />
    </>
  );
};

export default WindTurbineOverview;
