import { Table } from 'antd';
import React from 'react';
import usePermission, { Permission } from '../../permission/permission';
import { isMobile } from '../../utils/deviceDetection';
import { getPathFromType } from '../asset';
import { AssetRow } from '../asset/types';
import {
  MonitoringPointRow,
  useMonitoringPointTableColumns,
  useMonitoringPointTableOperationColumn,
  generatePropertyColumns,
  getRealPoints,
  sortMonitoringPointByAttributes
} from '../monitoring-point';
import { SelfLink } from '../../components/selfLink';
import { useLocaleContext } from '../../localeProvider';

export const MonitoringPointsTable = ({
  asset,
  showTitle = true,
  onUpdate,
  onDeleteSuccess
}: {
  asset: AssetRow;
  showTitle?: boolean;
  onUpdate: (point: MonitoringPointRow) => void;
  onDeleteSuccess: () => void;
}) => {
  const { id, name, monitoringPoints = [] } = asset;
  const { language } = useLocaleContext();
  const { hasPermission } = usePermission();
  const dataSource = sortMonitoringPointByAttributes(getRealPoints(monitoringPoints));
  const columnsOfProperties =
    monitoringPoints.length > 0 ? generatePropertyColumns(monitoringPoints[0], language) : [];
  const monitoringPointTableColumns = useMonitoringPointTableColumns();
  const monitoringPointTableOperationColumn = useMonitoringPointTableOperationColumn(
    onUpdate,
    onDeleteSuccess
  );
  const columnsForDisplay = [...monitoringPointTableColumns, ...columnsOfProperties];
  const columns = hasPermission(Permission.MeasurementAdd)
    ? [...columnsForDisplay, monitoringPointTableOperationColumn]
    : columnsForDisplay;

  return (
    <>
      {showTitle && (
        <SelfLink
          to={`/asset-management${getPathFromType(asset.type)}${id}`}
          state={[`${id}-${asset.type}`]}
          style={{ display: 'block', marginBottom: 8, fontSize: 16 }}
        >
          {name}
        </SelfLink>
      )}
      <Table
        rowKey={(record) => record.id}
        columns={columns}
        size='small'
        dataSource={dataSource}
        pagination={false}
        bordered={true}
        scroll={isMobile ? { x: 1000 } : { x: 1300 }}
      />
    </>
  );
};
