import React from 'react';
import { Button, Popconfirm, Space, Table, TableProps, Tag } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import {
  ASSET_PATHNAME,
  AssetRow,
  deleteMeasurement,
  MONITORING_POINT,
  MonitoringPointRow,
  Points
} from '../../asset-common';
import { SelfLink } from '../../../components/selfLink';
import {
  convertAlarmLevelToState,
  getAlarmLevelColor,
  getAlarmStateText
} from '../../../types/alarm';
import usePermission, { Permission } from '../../../permission/permission';
import { isMobile } from '../../../utils/deviceDetection';
import HasPermission from '../../../permission';

type Column = NonNullable<TableProps<MonitoringPointRow>['columns']>[0];

export const PointsTable = ({
  asset,
  onUpdate,
  onSuccess
}: {
  asset: AssetRow;
  onUpdate: (point: MonitoringPointRow) => void;
  onSuccess: () => void;
}) => {
  const basicColumns: Column[] = [
    {
      title: intl.get('NAME'),
      dataIndex: 'name',
      key: 'name',
      render: (name: string, row: MonitoringPointRow) => (
        <SelfLink
          to={`/${ASSET_PATHNAME}/${row.id}-${row.type}`}
          state={[`${row.id}-${row.type}`]}
          key={`${name}-${row.id}`}
        >
          {name}
        </SelfLink>
      )
    },
    {
      title: intl.get('STATUS'),
      dataIndex: 'alertLevel',
      key: 'alertLevel',
      render: (level: number, row: MonitoringPointRow) => {
        const alarmState = convertAlarmLevelToState(level);
        return (
          <Tag color={getAlarmLevelColor(alarmState)} key={`alertLevel-${row.id}`}>
            {intl.get(getAlarmStateText(alarmState))}
          </Tag>
        );
      }
    },
    {
      title: intl.get('SENSOR'),
      dataIndex: 'devices',
      key: 'devices',
      render: (name: string, row: MonitoringPointRow) =>
        row.bindingDevices && row.bindingDevices.length > 0
          ? row.bindingDevices.map(({ id, name }) => (
              <SelfLink to={`/devices/${id}`} key={`devices-${row.id}`}>
                {name}
              </SelfLink>
            ))
          : ''
    }
  ];
  const { monitoringPoints = [] } = asset;
  const { hasPermission } = usePermission();
  const actualPoints = Points.filter(monitoringPoints);
  const columns = basicColumns;

  if (hasPermission(Permission.MeasurementAdd)) {
    columns.push(generateOperationColumn(onUpdate, onSuccess));
  }

  return (
    <Table
      rowKey={(record) => record.id}
      columns={columns}
      size='small'
      dataSource={Points.sort(actualPoints)}
      pagination={false}
      bordered={true}
      scroll={isMobile ? { x: 1000 } : { x: 1300 }}
      style={{ marginBottom: 12 }}
    />
  );
};

function generateOperationColumn(
  onUpdate: (point: MonitoringPointRow) => void,
  onDeleteSuccess: () => void
): Column {
  return {
    title: intl.get('OPERATION'),
    key: 'action',
    render: (row: MonitoringPointRow) => (
      <Space>
        <HasPermission value={Permission.MeasurementEdit}>
          <Button
            type='text'
            size='small'
            title={intl.get('EDIT_SOMETHING', { something: intl.get(MONITORING_POINT) })}
          >
            <EditOutlined onClick={() => onUpdate(row)} />
          </Button>
        </HasPermission>
        <HasPermission value={Permission.MeasurementDelete}>
          <Popconfirm
            title={intl.get('DELETE_SOMETHING_PROMPT', { something: row.name })}
            onConfirm={() => {
              deleteMeasurement(row.id).then(onDeleteSuccess);
            }}
          >
            <Button
              type='text'
              danger={true}
              size='small'
              title={intl.get('DELETE_SOMETHING', { something: intl.get(MONITORING_POINT) })}
            >
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </HasPermission>
      </Space>
    ),
    width: 120
  };
}
