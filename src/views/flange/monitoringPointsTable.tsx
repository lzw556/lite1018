import { Table } from 'antd';
import React from 'react';
import usePermission, { Permission } from '../../permission/permission';
import { isMobile } from '../../utils/deviceDetection';
import { ASSET_PATHNAME, AssetRow } from '../asset/types';
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
  const { hasPermission } = usePermission();
  const { language } = useLocaleContext();
  const realPoints = getRealPoints(monitoringPoints);
  const dataSource = sortMonitoringPointByAttributes(realPoints);
  const columnsOfProperties =
    realPoints.length > 0 ? generatePropertyColumns(realPoints[0], language) : [];
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
          to={`/${ASSET_PATHNAME}/${id}-${asset.type}`}
          state={[`${id}-${asset.type}`]}
          style={{ display: 'block', marginBottom: 8, fontSize: 16 }}
          onClick={(e) => {
            if (e.ctrlKey) {
              e.preventDefault();
            }
          }}
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
