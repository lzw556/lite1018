import React from 'react';
import { Table, TableProps, Tag } from 'antd';
import intl from 'react-intl-universal';
import { Language, useLocaleContext } from '../../../localeProvider';
import { getDisplayName } from '../../../utils/format';
import dayjs from '../../../utils/dayjsUtils';
import { SelfLink } from '../../../components/selfLink';
import {
  convertAlarmLevelToState,
  getAlarmLevelColor,
  getAlarmStateText
} from '../../../types/alarm';
import { isMobile } from '../../../utils/deviceDetection';
import { pickDataOfFirstProperties } from '../../device/util';
import { ASSET_PATHNAME, AssetRow, MonitoringPointRow, Point, Points } from '../../asset-common';

type Column = NonNullable<TableProps<MonitoringPointRow>['columns']>[0];

export const ReadonlyPointsTable = ({ asset }: { asset: AssetRow }) => {
  const basicColumns: Column[] = [
    {
      title: intl.get('NAME'),
      dataIndex: 'name',
      key: 'name',
      width: isMobile ? 300 : 400,
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
      width: 120,
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
      width: 200,
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

  const { language } = useLocaleContext();
  const actualPoints = Points.filter(monitoringPoints);
  const columns = basicColumns;
  if (actualPoints.length > 0) {
    columns.push(...generatePropertyColumns(actualPoints[0], language));
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

function generateDatas(measurement: MonitoringPointRow) {
  const properties = Point.getPropertiesByType(measurement.properties, measurement.type).filter(
    (p) => p.first
  );
  const { data } = measurement;
  return pickDataOfFirstProperties(properties, data);
}

function generatePropertyColumns(measurement: MonitoringPointRow, lang: Language): Column[] {
  const properties = generateDatas(measurement);
  if (properties.length > 0) {
    return properties
      .map(({ name, key, fieldName }) => ({
        title: getDisplayName({
          name: intl.get(name),
          suffix: fieldName && intl.get(fieldName),
          lang
        }),
        key,
        render: (measurement: MonitoringPointRow) => {
          const datas = generateDatas(measurement);
          return datas.find((data) => key === data.key)?.value;
        },
        width: 120
      }))
      .concat({
        title: intl.get('SAMPLING_TIME'),
        key: 'timestamp',
        render: (measurement: MonitoringPointRow) => {
          return measurement.data && measurement.data.timestamp
            ? dayjs(measurement.data.timestamp * 1000).format('YYYY-MM-DD HH:mm:ss')
            : '-';
        },
        width: 200
      });
  }
  return [];
}
