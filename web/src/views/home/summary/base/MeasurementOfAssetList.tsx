import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Empty, Popconfirm, Space, Table, TableProps, Tag } from 'antd';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { AssetRow } from '../../assetList/props';
import { MeasurementTypes } from '../../common/constants';
import { generatePropertyColumns } from '../../common/historyDataHelper';
import {
  convertAlarmLevelToState,
  getAlarmLevelColor,
  getAlarmStateText
} from '../../common/statisticsHelper';
import { MeasurementRow } from '../measurement/props';
import { deleteMeasurement } from '../measurement/services';
import { combineFinalUrl } from '../../common/utils';
import usePermission, { Permission } from '../../../../permission/permission';
import HasPermission from '../../../../permission';
import { isMobile } from '../../../../utils/deviceDetection';
import { EditFormPayload } from '../../common/useActionBarStatus';
import * as AppConfig from '../../../../config';

export const MeasurementOfAssetList: React.FC<{
  asset?: AssetRow;
  pathname: string;
  search: string;
  handleMeasurementEdit: (data?: EditFormPayload) => void;
  fetchAssets: (filters?: Pick<AssetRow, 'type'>) => void;
}> = ({ asset, pathname, search, handleMeasurementEdit, fetchAssets }) => {
  const { hasPermission } = usePermission();

  const getColumns = (dataSource: TableProps<any>['dataSource']) => {
    const columns: any = [
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
        width: isMobile ? 300 : 400,
        render: (name: string, row: MeasurementRow) => (
          <Link to={combineFinalUrl(pathname, search, MeasurementTypes.preload.url, row.id)}>
            {name}
          </Link>
        )
      },
      {
        title: '状态',
        dataIndex: 'alertLevel',
        key: 'alertLevel',
        width: 120,
        render: (level: number) => {
          const alarmState = convertAlarmLevelToState(level);
          return (
            <Tag
              style={{
                border: `solid 1px ${getAlarmLevelColor(alarmState)}`,
                color: getAlarmLevelColor(alarmState)
              }}
            >
              {getAlarmStateText(alarmState)}
            </Tag>
          );
        }
      },
      {
        title: '传感器',
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
      ...generatePropertyColumns(dataSource && dataSource.length > 0 ? dataSource[0] : [])
    ];
    if (hasPermission(Permission.AssetAdd)) {
      return columns.concat([
        {
          title: '操作',
          key: 'action',
          render: (row: MeasurementRow) => (
            <Space>
              <Button type='text' size='small' title='编辑监测点'>
                <EditOutlined onClick={() => handleMeasurementEdit({ measurement: row })} />
              </Button>
              <HasPermission value={Permission.MeasurementDelete}>
                <Popconfirm
                  title={'确定要删除该监测点吗?'}
                  onConfirm={() => {
                    deleteMeasurement(row.id).then(() => {
                      fetchAssets({ type: AppConfig.use('wind').assetType.id });
                    });
                  }}
                >
                  <Button type='text' danger={true} size='small' title='删除监测点'>
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

  return (
    <Table
      {...{
        rowKey: 'id',
        columns: getColumns(asset?.monitoringPoints),
        size: 'small',
        dataSource: asset?.monitoringPoints,
        pagination: false,
        locale: {
          emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='暂无数据' />
        },
        bordered: true,
        scroll: isMobile ? { x: 1000 } : { x: 1300 }
      }}
    />
  );
};
