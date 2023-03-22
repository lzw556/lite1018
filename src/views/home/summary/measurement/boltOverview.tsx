import { Col, Empty, Row, Spin } from 'antd';
import * as React from 'react';
import { useLocation, useHistory, Link } from 'react-router-dom';
import '../../home.css';
import { MeasurementRow } from './props';
import { getMeasurement } from './services';
import { MeasurementContents } from './contentTabs';
import { MeasurementDevices } from './deviceTabs';
import { AssetNavigator } from '../../components/assetNavigator';
import intl from 'react-intl-universal';

const BoltOverview: React.FC = () => {
  const { search } = useLocation();
  const history = useHistory();
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
            {intl.get('NO_MONITORING_POINTS_PROMPT')}
            <Link to='/measurement-management?locale=measruement-management'>
              {intl.get('CREATE_ONE')}
            </Link>
            ,{intl.get('OR')}
            <a
              href='#!'
              onClick={(e) => {
                history.goBack();
                e.preventDefault();
              }}
            >
              {intl.get('RETURN')}
            </a>
          </p>
        }
      />
    );
  if (
    !measurement.bindingDevices ||
    (measurement.bindingDevices && measurement.bindingDevices.length === 0)
  )
    return (
      <Empty
        description={intl.get('MONITORING_POINT_ABNORMAL_PROMPT')}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );

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
