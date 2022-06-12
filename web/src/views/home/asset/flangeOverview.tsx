import { Empty, Spin } from 'antd';
import moment from 'moment';
import * as React from 'react';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { AssetNavigator } from '../components/assetNavigator';
import { MeasurementTypes } from '../common/constants';
import '../home.css';
import { MeasurementRow } from '../measurement/props';
import { getData } from '../measurement/services';
import { generateColProps, combineFinalUrl } from '../common/utils';
import { AssetRow } from './props';
import { getAsset } from './services';
import { OverviewPage, TableListItem } from '../components/overviewPage';
import { getAssetStatistics, NameValue } from '../common/statisticsHelper';
import { generateChartOptionsOfLastestData, generatePropertyColumns, HistoryData, generateChartOptionsOfHistoryData } from '../common/historyDataHelper';

const FlangeOverview: React.FC = () => {
  const { search, pathname } = useLocation();
  const history = useHistory();
  const id = Number(search.substring(search.lastIndexOf('id=') + 3));
  const [asset, setAsset] = React.useState<AssetRow>();
  const [loading, setLoading] = React.useState(true);
  const [measurements, setMeasurements] = React.useState<MeasurementRow[]>();
  const [statistics, setStatistics] = React.useState<NameValue[]>();
  const [statisticOfPreload, setStatisticOfPreload] = React.useState<any>();
  const [historyDatas, setHistoryDatas] = React.useState<
    { name: string; data: HistoryData }[]
  >([]);
  const [measurementType, setMeasurementType] =
    React.useState<typeof MeasurementTypes.loosening_angle>();
  const commonColumns = React.useMemo(
    () => [
      {
        title: '监测点',
        dataIndex: 'name',
        key: 'name',
        render: (name: string, row: MeasurementRow) => (
          <Link
            to={combineFinalUrl(pathname, search, MeasurementTypes.preload.url, row.id)}
          >
            {name}
          </Link>
        ),
        width: 200
      },
      { title: '状态', dataIndex: 'state', key: 'state', render: () => '', width: 120 }
    ],
    [pathname, search]
  );
  const [tableOfMeasurement, setTableOfMeasurement] = React.useState<TableListItem<MeasurementRow>>(
    {
      rowKey: 'id',
      title: () => <h3>当前数据</h3>,
      columns: commonColumns,
      colProps: generateColProps({ xl: 24, xxl: 24 }),
      size: 'small',
      pagination: false
    }
  );
  React.useEffect(() => {
    getAsset(id).then((asset) => {
      setLoading(false);
      setAsset(asset);
    });
  }, [id]);
  React.useEffect(() => {
    if (asset) {
      const { statistics, monitoringPoints } = asset;
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
      setMeasurements(monitoringPoints);
      if (monitoringPoints && monitoringPoints.length > 0) {
        setTableOfMeasurement((prev) => {
          if (prev.columns) {
            return {
              ...prev,
              columns: [...commonColumns, ...generatePropertyColumns(monitoringPoints[0])],
              dataSource: monitoringPoints
            };
          } else {
            return prev;
          }
        });
      }
    }
  }, [asset, commonColumns]);

  React.useEffect(() => {
    if (measurements && measurements.length > 0) {
      const measurementType = Object.values(MeasurementTypes).find(
        (type) => type.id === measurements[0].type
      );
      if (measurementType) setMeasurementType(measurementType);
      const from = moment().startOf('day').subtract(7, 'd').utc().unix();
      const to = moment().endOf('day').utc().unix();
      setHistoryDatas([]);
      measurements.forEach(({ id, name }) => {
        getData(id, from, to).then((data) => {
          if (data.length > 0) setHistoryDatas((prev) => [...prev, { name, data }]);
        });
      });
    }
  }, [measurements]);

  React.useEffect(() => {
    if (historyDatas.length > 0 && measurementType) {
      setStatisticOfPreload(generateChartOptionsOfHistoryData(historyDatas, measurementType));
    }
  }, [historyDatas, measurementType]);

  if (loading) return <Spin />;
  //TODO
  if (!measurements || measurements.length === 0)
    return (
      <Empty
        description={
          <p>
            还没有监测点, 去
            <Link to='/measurement-management?locale=measurement-management'>创建</Link>, 或
            <a
              href='#!'
              onClick={(e) => {
                history.go(-1);
                e.preventDefault();
              }}
            >
              返回
            </a>
          </p>
        }
      />
    );

  return (
    <>
      {asset && <AssetNavigator id={asset.id} parentId={asset.parentId} />}
      {measurementType && (
        <OverviewPage
          {...{
            statistics,
            tabelList: [tableOfMeasurement],
            chartList: [
              {
                title: '分布图',
                colProps: generateColProps({ xl: 12, xxl: 9 }),
                options: generateChartOptionsOfLastestData(measurements, {
                  inner: '65%',
                  outer: '80%'
                }),
                style: { height: 550 }
              },
              {
                title: `${measurementType.label}趋势`,
                colProps: generateColProps({ xl: 12, xxl: 15 }),
                options: statisticOfPreload,
                style: { height: 550 }
              }
            ]
          }}
        />
      )}
    </>
  );
};

export default FlangeOverview;
