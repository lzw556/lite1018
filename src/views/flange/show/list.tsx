import { Col, Empty, Row } from 'antd';
import React from 'react';
import { MonitoringPointRow, MONITORING_POINT } from '../../monitoring-point';
import { AssetRow } from '../../asset';
import { MonitoringPointsTable } from '../monitoringPointsTable';
import intl from 'react-intl-universal';

export const FlangeMonitoringPointList = ({
  flange,
  onUpdate,
  onDeleteSuccess
}: {
  flange: AssetRow;
  onUpdate: (point: MonitoringPointRow) => void;
  onDeleteSuccess: () => void;
}) => {
  const { monitoringPoints } = flange;

  if (monitoringPoints === undefined || monitoringPoints.length === 0)
    return (
      <Empty
        description={intl.get('NO_ASSET_PROMPT', { assetTypeLabel: intl.get(MONITORING_POINT) })}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  return (
    <Row gutter={[0, 16]}>
      <Col span={24}>
        <MonitoringPointsTable
          asset={flange}
          showTitle={false}
          onUpdate={onUpdate}
          onDeleteSuccess={onDeleteSuccess}
        />
      </Col>
    </Row>
  );
};
