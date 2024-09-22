import React from 'react';
import { Button, Col, Row, Table } from 'antd';
import intl from 'react-intl-universal';
import { getMeasurements, MONITORING_POINT, MonitoringPoint } from '../../monitoring-point';
import { ActionBar } from '../common/actionBar';
import { useActionBarStatus } from '../common/useActionBarStatus';
import usePermission, { Permission } from '../../../permission/permission';
import { PlusOutlined } from '@ant-design/icons';
import { AssetRow } from '../types';

export const Points = ({ asset, onSuccess }: { asset: AssetRow; onSuccess: () => void }) => {
  const actionStatus = useActionBarStatus();
  const { hasPermission } = usePermission();
  const [monitoringPoints, setMonitoringPoints] = React.useState<MonitoringPoint[]>();

  const fetchPoints = (id: number) => {
    getMeasurements({ asset_id: id }).then(setMonitoringPoints);
  };

  React.useEffect(() => {
    fetchPoints(asset.id);
  }, [asset.id]);

  return (
    <Table
      bordered
      columns={[{ dataIndex: 'name', title: intl.get('NAME') }]}
      dataSource={monitoringPoints}
      size='small'
      title={() => (
        <Row justify='end'>
          <Col>
            <ActionBar
              {...actionStatus}
              hasPermission={hasPermission(Permission.AssetAdd)}
              actions={[
                <Button
                  key='create-monitoring-point'
                  type='primary'
                  onClick={() => actionStatus.onMonitoringPointCreate(asset)}
                >
                  {intl.get('CREATE_SOMETHING', { something: intl.get(MONITORING_POINT) })}
                  <PlusOutlined />
                </Button>
              ]}
              onSuccess={() => {
                onSuccess();
                fetchPoints(asset.id);
              }}
            />
          </Col>
        </Row>
      )}
    />
  );
};
