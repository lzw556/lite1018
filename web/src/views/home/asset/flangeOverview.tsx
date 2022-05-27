import { Empty, Spin } from 'antd';
import moment from 'moment';
import * as React from 'react';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { AssetNavigator } from '../assetNavigator';
import { MeasurementTypes } from '../constants';
import '../home.css';
import { MeasurementRow } from '../measurement/props';
import { getMeasurements } from '../measurement/services';
import { OverviewPage } from '../overviewPage';
import { TableListItem, Overview } from '../props';
import { generateColProps, generateFlangeChartOptions } from '../utils';
import { AssetStatistics, usePreloadChartOptions } from './props';
import { getAsset } from './services';

const FlangeOverview: React.FC = () => {
  const { search } = useLocation();
  const history = useHistory();
  const id = Number(search.substring(search.lastIndexOf('id=') + 3));
  const [measurements, setMeasurements] = React.useState<{
    loading: boolean;
    items: MeasurementRow[];
  }>({
    loading: true,
    items: []
  });
  const [statistics, setStatistics] = React.useState<Overview['statistics']>();

  const statisticOfPreload = usePreloadChartOptions();
  const [tableOfMeasurement, setTableOfMeasurement] = React.useState<TableListItem<MeasurementRow>>(
    {
      rowKey: 'id',
      title: () => <h3>当前数据</h3>,
      columns: [
        {
          title: '监测点',
          dataIndex: 'name',
          key: 'name',
          render: (name: string, row: MeasurementRow) => (
            <Link to={`${MeasurementTypes.dynamicPreload.url}&id=${row.id}`}>{name}</Link>
          )
        },
        { title: '状态', dataIndex: 'state', key: 'state', render: () => '正常' },
        {
          title: '预紧力(kN)',
          dataIndex: 'preload',
          key: 'preload',
          render: () => 320 - Math.round(Math.random() * 10)
        },
        { title: '应力(Mpa)', dataIndex: 'preload2', key: 'preload2', render: () => '15' },
        {
          title: '温度(℃)',
          dataIndex: 'tempreture',
          key: 'tempreture',
          render: () => 50 + Math.round(Math.random() * 10)
        },
        {
          title: '采集时间',
          dataIndex: 'time',
          key: 'time',
          render: () => moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
        }
      ],
      colProps: generateColProps({ xl: 24, xxl: 24 }),
      size: 'small',
      pagination: false
    }
  );
  React.useEffect(() => {
    getAsset(id);
    getMeasurements({ asset_id: id }).then((measurements) =>
      setMeasurements({ loading: false, items: measurements })
    );
  }, [id]);
  React.useEffect(() => {
    if (!measurements.loading && measurements.items.length > 0) {
      setTableOfMeasurement((prev) => ({ ...prev, dataSource: measurements.items }));
    }
  }, [measurements]);

  if (measurements.loading) return <Spin />;
  //TODO
  if (measurements.items.length === 0)
    return (
      <Empty
        description={
          <p>
            还没有监测点, 去
            <Link to='/measurement-management?locale=measruement-management'>创建</Link>, 或
            <a
              href='#!'
              onClick={(e) => {
                history.goBack();
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
      <AssetNavigator id={id} />
      <OverviewPage
        {...{
          statistics,
          tabelList: [tableOfMeasurement],
          chartList: [
            {
              title: '分布图',
              colProps: generateColProps({ xl: 12, xxl: 9 }),
              options: generateFlangeChartOptions(measurements.items, {
                inner: '55%',
                outer: '70%'
              })
            },
            {
              title: '预紧力趋势',
              colProps: generateColProps({ xl: 12, xxl: 15 }),
              options: statisticOfPreload
            }
          ]
        }}
      />
    </>
  );
};

export default FlangeOverview;
