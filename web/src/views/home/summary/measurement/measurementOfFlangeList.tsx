import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Col, Empty, Popconfirm, Row, Space, Table, TableProps, Tag } from 'antd';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { AssetRow } from '../../assetList/props';
import { AssetTypes, MeasurementTypes } from '../../common/constants';
import { generatePropertyColumns } from '../../common/historyDataHelper';
import {
  convertAlarmLevelToState,
  getAlarmLevelColor,
  getAlarmStateText
} from '../../common/statisticsHelper';
import { MeasurementRow } from './props';
import { deleteMeasurement } from './services';
import { combineFinalUrl } from '../../common/utils';
import { sortMeasurementsByAttributes } from '../../measurementList/util';

export const MeasurementOfFlangeList: React.FC<{
  flange?: AssetRow;
  pathname: string;
  search: string;
  open: (selectedRow?: MeasurementRow) => void;
  fetchAssets: (filters?: Pick<AssetRow, 'type'>) => void;
}> = ({ flange, pathname, search, open, fetchAssets }) => {
  const generateTables = () => {
    if (!flange) return null;
    if (!flange.monitoringPoints || flange.monitoringPoints.length === 0)
      return <Empty description='没有法兰或监测点' image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    return (
      <Row gutter={[0, 16]}>
        {generateTable(sortMeasurementsByAttributes(flange.monitoringPoints))}
      </Row>
    );
  };

  const generateTable = (dataSource: TableProps<any>['dataSource']) => {
    return (
      <Col span={24}>
        <Table
          {...{
            rowKey: 'id',
            columns: [
              {
                title: '名称',
                dataIndex: 'name',
                key: 'name',
                // width: 300,
                render: (name: string, row: MeasurementRow) => (
                  <Link
                    to={combineFinalUrl(pathname, search, MeasurementTypes.preload.url, row.id)}
                  >
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
                        <Link to={`/device-management?locale=devices/deviceDetail&id=${id}`}>
                          {name}
                        </Link>
                      ))
                    : ''
              },
              ...generatePropertyColumns(dataSource ? dataSource[0] : []),
              {
                title: '操作',
                key: 'action',
                render: (row: MeasurementRow) => (
                  <Space>
                    <Button type='text' size='small' title='编辑监测点'>
                      <EditOutlined onClick={() => open(row)} />
                    </Button>
                    <Popconfirm
                      title={'确定要删除该监测点吗?'}
                      onConfirm={() => {
                        deleteMeasurement(row.id).then(() => {
                          fetchAssets({ type: AssetTypes.WindTurbind.id });
                        });
                      }}
                    >
                      <Button type='text' danger={true} size='small' title='删除监测点'>
                        <DeleteOutlined />
                      </Button>
                    </Popconfirm>
                  </Space>
                ),
                width: 120
              }
            ],
            size: 'small',
            dataSource,
            pagination: false,
            locale: {
              emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='暂无数据' />
            },
            bordered: true
          }}
        />
      </Col>
    );
  };

  return generateTables();
};
