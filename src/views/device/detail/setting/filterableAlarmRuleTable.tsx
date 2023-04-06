import { Row, Col, Popconfirm, Button } from 'antd';
import * as React from 'react';
import { PageResult } from '../../../../types/page';
import { isMobile } from '../../../../utils/deviceDetection';
import TableLayout from '../../../layout/TableLayout';
import intl from 'react-intl-universal';
import { translateMetricName } from '../../../alarm/alarm-group';

export const FilterableAlarmRuleTable: React.FC<{
  dataSource: PageResult<any[]>;
  fetchData: (current: number, size: number) => void;
  rowSelection?: any;
  onRemove?: (id: number) => void;
}> = ({ dataSource, fetchData, rowSelection, onRemove }) => {
  const columns: any = [
    {
      title: intl.get('ALARM_RULE_NAME'),
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: intl.get('ALARM_METRIC'),
      dataIndex: 'metric',
      key: 'metric',
      render: (metric: any) => translateMetricName(metric.name)
    },
    {
      title: intl.get('ALARM_CONDITION'),
      dataIndex: 'condition',
      key: 'condition',
      render: (_: any, record: any) => {
        return `${record.operation} ${record.threshold} ${record.metric.unit}`;
      }
    }
  ];
  if (onRemove) {
    columns.push({
      title: intl.get('OPERATION'),
      key: 'action',
      render: (_: any) => {
        return (
          <Popconfirm
            title={intl.get('REMOVE_CONFIRM_PROMPT')}
            onConfirm={() => onRemove(_.id)}
            okText={intl.get('REMOVE')}
            cancelText={intl.get('CANCEL')}
          >
            <Button type='text' size='small' danger>
              {intl.get('REMOVE')}
            </Button>
          </Popconfirm>
        );
      }
    });
  }
  return (
    <Row>
      <Col span={24}>
        <TableLayout
          columns={columns}
          dataSource={dataSource}
          onPageChange={fetchData}
          simple={isMobile}
          scroll={isMobile ? { x: 1200 } : undefined}
          rowSelection={rowSelection}
        />
      </Col>
    </Row>
  );
};
