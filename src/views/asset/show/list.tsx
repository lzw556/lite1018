import { Col, Empty, Row } from 'antd';
import React from 'react';
import { sortFlangesByAttributes, MonitoringPointsTable } from '../../flange';
import { MonitoringPointRow } from '../../monitoring-point';
import { AssetRow } from '../types';
import intl from 'react-intl-universal';
import { useAssetCategoryChain } from '../../../config/assetCategory.config';

export const WindTurbineMonitoringPointList = ({
  wind,
  onUpdate,
  onDeleteSuccess
}: {
  wind: AssetRow;
  onUpdate: (point: MonitoringPointRow) => void;
  onDeleteSuccess: () => void;
}) => {
  const { children } = wind;
  const { last } = useAssetCategoryChain();

  if (children === undefined || children.length === 0)
    return (
      <Empty
        description={intl.get('NO_ASSET_PROMPT', { assetTypeLabel: intl.get(last.label) })}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
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
