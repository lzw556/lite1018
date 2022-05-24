import { Empty, Spin, TableProps } from 'antd';
import { number } from 'echarts';
import moment from 'moment';
import * as React from 'react';
import { Link, useLocation, useHistory } from 'react-router-dom';
import MyBreadcrumb from '../../../components/myBreadcrumb';
import { Series_Bar } from '../charts/bar';
import { ChartOptions } from '../charts/common';
import { Series_Line } from '../charts/line';
import '../home.css';
import { Measurement, MeasurementRow } from './props';
import { getData, getMeasurements } from './services';
import { OverviewPage } from '../overviewPage';
import { Overview, TableListItem } from '../props';

const BoltOverview: React.FC = () => {
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

  React.useEffect(() => {
    getMeasurements({ asset_id: id }).then((measurements) =>
      setMeasurements({ loading: false, items: measurements })
    );
  }, [id]);

  React.useEffect(() => {
    const from = moment().startOf('day').subtract(7, 'd').utc().unix();
    const to = moment().endOf('day').utc().unix();
    getData(1, from, to);
  }, []);

  // if (measurements.loading) return <Spin />;
  // //TODO
  // if (measurements.items.length === 0)
  //   return (
  //     <Empty
  //       description={
  //         <p>
  //           还没有监测点, 去<Link to='/measurement-management?locale=measruement-management'>创建</Link>, 或
  //           <a href='#!' onClick={(e) => {
  //             history.go(-1);
  //             e.preventDefault();
  //           }}>返回</a>
  //         </p>
  //       }
  //     />
  //   );

  return (
    <>
      <MyBreadcrumb />
      {/* <OverviewPage {...{ properties, tabelList: [tableOfMeasurement] }} /> */}
      boltOverview- {id}
    </>
  );
};

export default BoltOverview;
