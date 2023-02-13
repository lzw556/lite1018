import { Row, Col, Popconfirm, Button } from 'antd';
import * as React from 'react';
import { PageResult } from '../../../../types/page';
import { isMobile } from '../../../../utils/deviceDetection';
import TableLayout from '../../../layout/TableLayout';

export const FilterableAlarmRuleTable: React.FC<{
  dataSource: PageResult<any[]>;
  fetchData: (current: number, size: number) => void;
  rowSelection?: any;
  onRemove?: (id: number) => void;
}> = ({ dataSource, fetchData, rowSelection, onRemove }) => {
  const columns: any = [
    {
      title: '规则名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '资源指标',
      dataIndex: 'metric',
      key: 'metric',
      render: (metric: any) => metric.name
    },
    {
      title: '触发条件',
      dataIndex: 'condition',
      key: 'condition',
      render: (_: any, record: any) => {
        return `${record.operation} ${record.threshold} ${record.metric.unit}`;
      }
    }
  ];
  if (onRemove) {
    columns.push({
      title: '操作',
      key: 'action',
      render: (_: any) => {
        return (
          <Popconfirm
            title={`确认要移除吗?`}
            onConfirm={() => onRemove(_.id)}
            okText='移除'
            cancelText='取消'
          >
            <Button type='text' size='small' danger>
              移除
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
