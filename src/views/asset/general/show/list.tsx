import { Col, Empty, Row } from 'antd';
import React from 'react';
import { NO_FLANGES, sortFlangesByAttributes, MonitoringPointsTable } from '../../../flange';
import { MonitoringPointRow } from '../../../monitoring-point';
import { AssetRow } from '../../types';
import intl from 'react-intl-universal';

export const GeneralMonitoringPointList = ({
  wind,
  onUpdate,
  onDeleteSuccess
}: {
  wind: AssetRow;
  onUpdate: (point: MonitoringPointRow) => void;
  onDeleteSuccess: () => void;
}) => {
  const { children } = wind;

  if (children === undefined || children.length === 0)
    return <Empty description={intl.get(NO_FLANGES)} image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  return (
    <Row gutter={[0, 16]}>
      {sortFlangesByAttributes(children).map((f) => (
        <Col span={24} key={f.id}>
          <MonitoringPointsTable asset={f} onUpdate={onUpdate} onDeleteSuccess={onDeleteSuccess} />
        </Col>
      ))}
    </Row>
  );
};
