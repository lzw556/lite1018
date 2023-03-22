import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Space, Tag } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import HasPermission from '../../permission';
import { Permission } from '../../permission/permission';
import { isMobile } from '../../utils/deviceDetection';
import { convertAlarmLevelToState, getAlarmLevelColor, getAlarmStateText } from '../asset';
import { deleteMeasurement } from './services';
import {
  DELETE_MONITORING_POINT,
  MonitoringPointRow,
  MONITORING_POINT_PATHNAME,
  UPDATE_MONITORING_POINT
} from './types';
import intl from 'react-intl-universal';

export const useMonitoringPointTableColumns = () => {
  const { state } = useLocation();
  return [
    {
      title: intl.get('NAME'),
      dataIndex: 'name',
      key: 'name',
      width: isMobile ? 300 : 400,
      render: (name: string, row: MonitoringPointRow) => (
        <Link to={`/${MONITORING_POINT_PATHNAME}/${row.id}`} state={state}>
          {name}
        </Link>
      )
    },
    {
      title: intl.get('STATUS'),
      dataIndex: 'alertLevel',
      key: 'alertLevel',
      width: 120,
      render: (level: number) => {
        const alarmState = convertAlarmLevelToState(level);
        return <Tag color={getAlarmLevelColor(alarmState)}>{getAlarmStateText(alarmState)}</Tag>;
      }
    },
    {
      title: intl.get('SENSOR'),
      dataIndex: 'devices',
      key: 'devices',
      width: 200,
      render: (name: string, row: MonitoringPointRow) =>
        row.bindingDevices && row.bindingDevices.length > 0
          ? row.bindingDevices.map(({ id, name }) => <Link to={`/devices/${id}`}>{name}</Link>)
          : ''
    }
  ];
};

export const useMonitoringPointTableOperationColumn = (
  onUpdate: (point: MonitoringPointRow) => void,
  onDeleteSuccess: () => void
) => {
  return {
    title: intl.get('OPERATION'),
    key: 'action',
    render: (row: MonitoringPointRow) => (
      <Space>
        <HasPermission value={Permission.MeasurementEdit}>
          <Button type='text' size='small' title={intl.get(UPDATE_MONITORING_POINT)}>
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
              title={intl.get(DELETE_MONITORING_POINT)}
            >
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </HasPermission>
      </Space>
    ),
    width: 120
  };
};
