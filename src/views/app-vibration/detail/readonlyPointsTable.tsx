import React from 'react';
import { Button, Checkbox, Col, Popover, Row, Table, TableProps, Tabs, Tag, Tooltip } from 'antd';
import { CheckboxGroupProps } from 'antd/es/checkbox';
import intl from 'react-intl-universal';
import { uniq } from 'lodash';
import { DisplayProperty } from '../../../constants/properties';
import { useLocaleContext } from '../../../localeProvider';
import { isMobile } from '../../../utils/deviceDetection';
import dayjs from '../../../utils/dayjsUtils';
import {
  convertAlarmLevelToState,
  getAlarmLevelColor,
  getAlarmStateText
} from '../../../types/alarm';
import { Flex } from '../../../components';
import { SelfLink } from '../../../components/selfLink';
import { ASSET_PATHNAME, AssetRow, MonitoringPointRow, Point, Points } from '../../asset-common';
import { SettingOutlined } from '@ant-design/icons';
import { MonitoringPointTypeText, MonitoringPointTypeValue } from '../../../config';
import { getPropertyColumns } from './overview';

type Column = NonNullable<TableProps<MonitoringPointRow>['columns']>[0];

export const ReadonlyPointsTable = ({ asset }: { asset: AssetRow }) => {
  const basicColumns: Column[] = [
    {
      title: intl.get('NAME'),
      dataIndex: 'name',
      key: 'name',
      width: 240,
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
      width: 120,
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
  const actualPoints = Points.filter(monitoringPoints);

  if (actualPoints.length > 0) {
    const types = uniq(actualPoints.map((m) => m.type));
    if (types.length > 1) {
      return (
        <Tabs
          items={types.map((t) => ({
            key: `${t}`,
            label: intl.get(
              MonitoringPointTypeText[
                MonitoringPointTypeValue[t] as keyof typeof MonitoringPointTypeText
              ]
            ),
            children: (
              <FilterTable
                monitoringPonits={actualPoints.filter((m) => m.type === t)}
                initialColumns={basicColumns}
              />
            )
          }))}
        />
      );
    } else {
      return <FilterTable monitoringPonits={actualPoints} initialColumns={basicColumns} />;
    }
  } else {
    return (
      <Table
        rowKey={(record) => record.id}
        columns={basicColumns}
        size='small'
        dataSource={Points.sort(actualPoints)}
        pagination={false}
        bordered={true}
        scroll={isMobile ? { x: 1000 } : { x: 1300 }}
        style={{ marginBottom: 12 }}
      />
    );
  }
};

function FilterTable({
  monitoringPonits,
  initialColumns
}: {
  monitoringPonits: MonitoringPointRow[];
  initialColumns: Column[];
}) {
  const point = monitoringPonits[0];
  const properties = Point.getPropertiesByType(point.properties, point.type);
  const [checkedList, setCheckedList] = React.useState(
    properties.filter((p) => p.first).map((p) => p.key)
  );
  const { language } = useLocaleContext();
  const columns = getPropertyColumns(point, language);
  const newColumns = columns.map((item) => ({
    ...item,
    hidden: !checkedList.includes(item.key as string)
  }));

  return (
    <>
      <Table
        tableLayout='fixed'
        rowKey={(record) => record.id}
        columns={[
          ...initialColumns,
          ...newColumns,
          {
            title: intl.get('SAMPLING_TIME'),
            key: 'timestamp',
            render: (measurement: MonitoringPointRow) => {
              return measurement.data && measurement.data.timestamp
                ? dayjs(measurement.data.timestamp * 1000).format('YYYY-MM-DD HH:mm:ss')
                : '-';
            },
            width: 120
          }
        ]}
        size='small'
        dataSource={Points.sort(monitoringPonits)}
        pagination={false}
        bordered={true}
        scroll={
          initialColumns.length + newColumns.filter((c) => c.hidden === false).length <= 7
            ? { x: 900 }
            : { x: 1300 }
        }
        title={() => (
          <Flex>
            <Popover
              arrow={false}
              content={
                <CheckBoxColumnList
                  checkedList={checkedList}
                  onCheck={(value) => {
                    setCheckedList(value as string[]);
                  }}
                  properties={properties}
                />
              }
              overlayStyle={{ maxWidth: 300, maxHeight: 300 }}
              placement='leftBottom'
              trigger='click'
            >
              <Tooltip title={intl.get('set.columns')}>
                <Button icon={<SettingOutlined />} type='text' size='small' />
              </Tooltip>
            </Popover>
          </Flex>
        )}
      />
    </>
  );
}

function CheckBoxColumnList({
  checkedList,
  properties,
  onCheck
}: {
  checkedList: string[];
  properties: DisplayProperty[];
  onCheck?: CheckboxGroupProps['onChange'];
}) {
  return (
    <Checkbox.Group value={checkedList} onChange={onCheck}>
      <Row>
        {properties.map((p) => (
          <Col span={24} key={p.key}>
            <Checkbox value={p.key}>{intl.get(p.name)}</Checkbox>
          </Col>
        ))}
      </Row>
    </Checkbox.Group>
  );
}
