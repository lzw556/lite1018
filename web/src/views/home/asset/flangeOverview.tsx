import { Empty, Spin, TableProps } from 'antd';
import { number } from 'echarts';
import * as React from 'react';
import { Link, useLocation, useHistory } from 'react-router-dom';
import MyBreadcrumb from '../../../components/myBreadcrumb';
import { Series_Bar } from '../charts/bar';
import { ChartOptions } from '../charts/common';
import { Series_Line } from '../charts/line';
import '../home.css';
import { Measurement, MeasurementRow } from '../measurement/props';
import { getMeasurements } from '../measurement/services';
import { OverviewPage } from '../overviewPage';
import { Overview, TableListItem } from '../props';

const FlangeOverview: React.FC = () => {
  const { search } = useLocation();
  const history = useHistory();
  const id = Number(search.substring(search.lastIndexOf('id=') + 3));
  const [overview, setOverview] = React.useState<Overview>();
  const [measurements, setMeasurements] = React.useState<{
    loading: boolean;
    items: MeasurementRow[];
  }>({
    loading: true,
    items: []
  });
  const [properties, setProperties] = React.useState([
    { name: '监测点数量', value: 8 },
    { name: '紧急报警监测点数量', value: 0 },
    { name: '重要报警监测点数量', value: 0 },
    { name: '次要报警监测点数量', value: 0 },
    { name: '传感器数量', value: 8 },
    { name: '离线传感器数量', value: 0 }
  ]);
  const colProps = {
    xs: { span: 24 },
    sm: { span: 24 },
    md: { span: 24 },
    xl: { span: 12 },
    xxl: { span: 9 }
  };
  const colProps2 = {
    xs: { span: 24 },
    sm: { span: 24 },
    md: { span: 24 },
    xl: { span: 12 },
    xxl: { span: 15 }
  };
  const colProps3 = {
    xs: { span: 24 },
    sm: { span: 24 },
    md: { span: 24 },
    xl: { span: 24 },
    xxl: { span: 24 }
  };

  const [statictisOfFlange, setStatictisOfFlange] = React.useState()
  const [tableOfMeasurement, setTableOfMeasurement] = React.useState<TableListItem<MeasurementRow>>(
    {
      rowKey: 'id',
      title: () => <h3>当前数据</h3>,
      columns: [
        { title: '监测点', dataIndex: 'name', key: 'name' },
        { title: '状态', dataIndex: 'state', key: 'state' },
        { title: '预紧力(kN)', dataIndex: 'preload', key: 'preload' },
        { title: '应力(Mpa)', dataIndex: 'preload2', key: 'preload2' },
        { title: '温度(℃)', dataIndex: 'tempreture', key: 'tempreture' },
        { title: '采集时间', dataIndex: 'time', key: 'time' }
      ],
      colProps: colProps3,
      size: 'small',
      pagination: false
    }
  );
  React.useEffect(() => {
    getMeasurements({ asset_id: id }).then((measurements) =>
      setMeasurements({ loading: false, items: measurements })
    );
  }, [id]);
  React.useEffect(() => {
    if (!measurements.loading && measurements.items.length > 0) {
      setTableOfMeasurement((prev) => ({ ...prev, dataSource: measurements.items }));
    }
    const data = [
      320, 320, 320, 320, 320, 320, 320, 320, 320, 320, 320, 320, 320, 320, 320, 320, 320, 320, 320,
      320
    ];
    const times = data.map((item: number, index: number) => `2022-04-${5 + index}`);

    const statisticOfPreload: ChartOptions<Series_Line> = {
      title: {
        text: '',
        left: 'center'
      },
      legend: { bottom: 0 },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: times
      },
      yAxis: { type: 'value', min: 290, max: 360 },
      series: [
        {
          type: 'line',
          name: '1号螺栓',
          data: data.map((item) => item + Math.random() * 10)
        },
        {
          type: 'line',
          name: '2号螺栓',
          data: data.map((item) => item + Math.random() * 10)
        },
        {
          type: 'line',
          name: '3号螺栓',
          data: data.map((item) => item + Math.random() * 10)
        },
        {
          type: 'line',
          name: '4号螺栓',
          data: data.map((item) => item + Math.random() * 10)
        },
        {
          type: 'line',
          name: '5号螺栓',
          data: data.map((item) => item + Math.random() * 10)
        },
        {
          type: 'line',
          name: '6号螺栓',
          data: data.map((item) => item + Math.random() * 10)
        },
        {
          type: 'line',
          name: '7号螺栓',
          data: [329, 328, 321, 325, 325, 329, 320, 328, 335, 328, 312, 311, 310, 330, 333]
        },
        {
          type: 'line',
          name: '8号螺栓',
          data: [334, 318, 331, 325, 335, 329, 330, 328, 335, 318, 312, 311, 310, 340, 333]
        }
      ]
    };

  }, [measurements]);

  if (measurements.loading) return <Spin />;
  //TODO
  if (measurements.items.length === 0)
    return (
      <Empty
        description={
          <p>
            还没有监测点, 去<Link to='/measurement-management?locale=measruement-management'>创建</Link>, 或
            <a href='#!' onClick={(e) => {
              history.go(-1);
              e.preventDefault();
            }}>返回</a>
          </p>
        }
      />
    );

  return (
    <>
      <MyBreadcrumb />
      <OverviewPage {...{ properties, tabelList: [tableOfMeasurement] }} />
    </>
  );
};

export default FlangeOverview;
