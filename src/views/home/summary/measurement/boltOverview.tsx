import { Col, Empty, Row, Spin } from 'antd';
import * as React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import '../../home.css';
import { MeasurementRow } from './props';
import { getMeasurement } from './services';
import { MeasurementContents } from './contentTabs';
import { MeasurementDevices } from './deviceTabs';
import { AssetNavigator } from '../../components/assetNavigator';

const BoltOverview: React.FC = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const id = Number(search.substring(search.lastIndexOf('id=') + 3));
  const [loading, setLoading] = React.useState(true);
  const [measurement, setMeasurement] = React.useState<MeasurementRow>();
  const [isForceRefresh, setIsForceRefresh] = React.useState(0);

  const fetchMeasurement = (id: number) => {
    getMeasurement(id).then((measurement) => {
      setMeasurement(measurement);
      setLoading(false);
    });
  };
  React.useEffect(() => {
    fetchMeasurement(id);
  }, [id]);

  if (loading) return <Spin />;
  if (!measurement)
    return (
      <Empty
        description={
          <p>
            还没有监测点, 去<Link to='measurement-management'>创建</Link>, 或
            <a
              href='#!'
              onClick={(e) => {
                navigate(-1);
                e.preventDefault();
              }}
            >
              返回
            </a>
          </p>
        }
      />
    );
  if (
    !measurement.bindingDevices ||
    (measurement.bindingDevices && measurement.bindingDevices.length === 0)
  )
    return <Empty description='此监测点异常!' image={Empty.PRESENTED_IMAGE_SIMPLE} />;

  return (
    <>
      <AssetNavigator
        id={measurement.id}
        parentId={measurement.assetId}
        isForceRefresh={isForceRefresh}
      />
      <Row gutter={[0, 16]}>
        <Col span={24}>
          <MeasurementDevices
            devices={measurement.bindingDevices}
            alertLevel={measurement.alertLevel}
          />
        </Col>
        <Col span={24}>
          <MeasurementContents
            {...measurement}
            onUpdate={() => {
              fetchMeasurement(id);
              setIsForceRefresh((prev) => ++prev);
            }}
          />
        </Col>
      </Row>
    </>
  );
};

export default BoltOverview;
