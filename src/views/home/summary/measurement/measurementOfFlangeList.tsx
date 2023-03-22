import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Col, Empty, Popconfirm, Row, Space, Table, TableProps, Tag } from 'antd';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { AssetRow } from '../../assetList/props';
import { generatePropertyColumns } from '../../common/historyDataHelper';
import {
  convertAlarmLevelToState,
  getAlarmLevelColor,
  getAlarmStateText
} from '../../common/statisticsHelper';
import { MeasurementRow } from './props';
import { deleteMeasurement } from './services';
import { combineFinalUrl, getRealPoints } from '../../common/utils';
import { sortMeasurementsByAttributes } from '../../measurementList/util';
import usePermission, { Permission } from '../../../../permission/permission';
import HasPermission from '../../../../permission';
import { isMobile } from '../../../../utils/deviceDetection';
import ShadowCard from '../../../../components/shadowCard';
import { EditFormPayload } from '../../common/useActionBarStatus';
import * as AppConfig from '../../../../config';
import { measurementTypes } from '../../common/constants';
import intl from 'react-intl-universal';

export const MeasurementOfFlangeList: React.FC<{
  flange?: AssetRow;
  pathname: string;
  search: string;
  handleMeasurementEdit: (data?: EditFormPayload) => void;
  fetchAssets: (filters?: Pick<AssetRow, 'type'>) => void;
}> = ({ flange, pathname, search, handleMeasurementEdit, fetchAssets }) => {
  const { hasPermission } = usePermission();
  const generateTables = () => {
    if (!flange) return null;
    const measurements = getRealPoints(flange.monitoringPoints);
    if (measurements.length === 0)
      return (
        <ShadowCard>
          <Empty
            description={intl.get('NO_MONITORING_POINTS')}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </ShadowCard>
      );
    return <Row gutter={[0, 16]}>{generateTable(sortMeasurementsByAttributes(measurements))}</Row>;
  };

  const getColumns = (dataSource: TableProps<any>['dataSource']) => {
    const columns: any = [
      {
        title: intl.get('NAME'),
        dataIndex: 'name',
        key: 'name',
        width: isMobile ? 300 : 400,
        render: (name: string, row: MeasurementRow) => (
          <Link to={combineFinalUrl(pathname, search, measurementTypes.preload.url, row.id)}>
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
        render: (name: string, row: MeasurementRow) =>
          row.bindingDevices && row.bindingDevices.length > 0
            ? row.bindingDevices.map(({ id, name }) => (
                <Link to={`/device-management?locale=devices/deviceDetail&id=${id}`}>{name}</Link>
              ))
            : ''
      },
      ...generatePropertyColumns(dataSource ? dataSource[0] : [])
    ];
    if (hasPermission(Permission.AssetAdd)) {
      return columns.concat([
        {
          title: intl.get('OPERATION'),
          key: 'action',
          render: (row: MeasurementRow) => (
            <Space>
              <Button type='text' size='small' title={intl.get('EDIT_MONITORING_POINT')}>
                <EditOutlined onClick={() => handleMeasurementEdit({ measurement: row })} />
              </Button>
              <HasPermission value={Permission.MeasurementDelete}>
                <Popconfirm
                  title={intl.get('DELETE_MONITORING_POINT_PROMPT')}
                  onConfirm={() => {
                    deleteMeasurement(row.id).then(() => {
                      fetchAssets({ type: AppConfig.use('wind').assetType.id });
                    });
                  }}
                >
                  <Button
                    type='text'
                    danger={true}
                    size='small'
                    title={intl.get('DELETE_MONITORING_POINT')}
                  >
                    <DeleteOutlined />
                  </Button>
                </Popconfirm>
              </HasPermission>
            </Space>
          ),
          width: 120
        }
      ]);
    } else {
      return columns;
    }
  };

  const generateTable = (dataSource: TableProps<any>['dataSource']) => {
    return (
      <Col span={24}>
        <Table
          {...{
            rowKey: 'id',
            columns: getColumns(dataSource),
            size: 'small',
            dataSource,
            pagination: false,
            locale: {
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={intl.get('NO_DATA_PROMPT')}
                />
              )
            },
            bordered: true,
            scroll: isMobile ? { x: 1000 } : { x: 1300 }
          }}
        />
      </Col>
    );
  };

  return generateTables();
};
