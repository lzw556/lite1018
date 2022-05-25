import { Col, Empty, Row, Spin } from 'antd';
import * as React from 'react';
import { useLocation, useHistory, Link } from 'react-router-dom';
import MyBreadcrumb from '../../../components/myBreadcrumb';
import '../home.css';
import { MeasurementRow } from './props';
import { getMeasurement } from './services';
import { MeasurementContents } from './contentTabs';
import { MeasurementDevices } from './deviceTabs';

const BoltOverview: React.FC = () => {
  const { search } = useLocation();
  const history = useHistory();
  const id = Number(search.substring(search.lastIndexOf('id=') + 3));
  const [loading, setLoading] = React.useState(true);
  const [measurement, setMeasurement] = React.useState<MeasurementRow>();

  React.useEffect(() => {
    getMeasurement(id).then((measurement) => {
      setMeasurement(measurement);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <Spin />;
  if (!measurement)
    return (
      <Empty
        description={
          <p>
            还没有监测点, 去
            <Link to='/measurement-management?locale=measruement-management'>创建</Link>, 或
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
  if (measurement.bindingDevices.length === 0) return <Empty description='此监测点异常!' />;

  return (
    <>
      <MyBreadcrumb />
      <Row gutter={[0, 16]}>
        <Col span={24}>
          <MeasurementDevices devices={measurement.bindingDevices} />
        </Col>
        <Col span={24}>
          <MeasurementContents {...measurement} />
        </Col>
      </Row>
    </>
  );
};

export default BoltOverview;
