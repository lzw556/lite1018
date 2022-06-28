import { Button, Empty, Space, Spin, Table, TableProps, Tag } from 'antd';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { MeasurementTypes } from '../../../../common/constants';
import {
  convertAlarmLevelToState,
  getAlarmLevelColor,
  getAlarmStateText
} from '../../../../common/statisticsHelper';
import { AlarmRule, MeasurementRow } from '../../props';
import {
  bindMeasurementsToAlarmRule,
  getAlarmRules,
  unbindMeasurementsToAlarmRule
} from '../../services';

export const AlarmRuleSetting: React.FC<MeasurementRow & { onUpdate?: () => void }> = (props) => {
  const [allRules, setAllRules] = React.useState<AlarmRule[]>();
  const [loading, setLoading] = React.useState(true);
  const getRules = (dataSource: AlarmRule['rules']): TableProps<any> => {
    return {
      rowKey: 'id',
      columns: [
        { title: '名称', dataIndex: 'name', key: 'name', width: 400 },
        {
          title: '资源指标',
          dataIndex: 'metric',
          key: 'metric',
          render: (metric: any) => metric.name,
          width: 120
        },
        {
          title: '触发条件',
          dataIndex: 'condition',
          key: 'condition',
          render: (_: any, record: any) => {
            return `${record.operation} ${record.threshold} ${record.metric.unit}`;
          },
          width: 150
        },
        {
          title: '报警等级',
          dataIndex: 'level',
          key: 'level',
          width: 100,
          render: (level: number) => {
            const alarmState = convertAlarmLevelToState(level);
            return (
              <Tag color={getAlarmLevelColor(alarmState)}>{getAlarmStateText(alarmState)}</Tag>
            );
          }
        }
      ],
      dataSource,
      pagination: false,
      size: 'small',
      style: { marginLeft: 20, width: 770 }
    };
  };
  const columns = [
    {
      title: '状态',
      dataIndex: 'bindedStatus',
      key: 'bindedStatus',
      width: 100,
      render: (status: boolean) => (
        <Tag color={status ? 'green' : 'geekblue'}>{status ? '已绑定' : '未绑定'}</Tag>
      )
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 400
    },
    {
      title: '监测点类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (typeId: number) => {
        const type = Object.values(MeasurementTypes).find(({ id }) => id === typeId);
        return type ? type.label : '-';
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, row: AlarmRule) => {
        return (
          <Space>
            {row.bindedStatus ? (
              <Button
                type='link'
                size='small'
                title={`移除`}
                danger={true}
                onClick={() => {
                  updateRow(row.id, { bindingStatus: true });
                  unbindMeasurementsToAlarmRule(row.id, { monitoring_point_ids: [props.id] }).then(
                    () => updateRow(row.id, { bindedStatus: false, bindingStatus: false })
                  );
                }}
              >
                {row.bindingStatus ? <Spin /> : '移除'}
              </Button>
            ) : (
              <Button
                type='link'
                size='small'
                title={`绑定`}
                onClick={() => {
                  updateRow(row.id, { bindingStatus: true });
                  bindMeasurementsToAlarmRule(row.id, { monitoring_point_ids: [props.id] }).then(
                    () => updateRow(row.id, { bindedStatus: true, bindingStatus: false })
                  );
                }}
              >
                {row.bindingStatus ? <Spin /> : '绑定'}
              </Button>
            )}
          </Space>
        );
      }
    }
  ];

  const updateRow = (id: number, data: {}) => {
    if (allRules && allRules.length > 0) {
      setAllRules(
        allRules.map((rule) => {
          if (rule.id === id) {
            return { ...rule, ...data };
          } else {
            return rule;
          }
        })
      );
    }
  };

  const fetchAlarmRules = (type: number) => {
    getAlarmRules().then((data) => {
      setLoading(false);
      setAllRules(data.filter((rule) => rule.type === type));
    });
  };

  React.useEffect(() => {
    fetchAlarmRules(props.type);
  }, [props.type]);

  React.useEffect(() => {
    if (
      allRules &&
      allRules.length > 0 &&
      allRules.every(({ bindedStatus }) => bindedStatus === undefined || bindedStatus === null)
    ) {
      getAlarmRules(props.id).then((data) => {
        setAllRules(
          allRules.map((rule) => ({
            ...rule,
            bindedStatus: !!data.find(({ id }) => id === rule.id)
          }))
        );
      });
    }
  }, [props.id, allRules]);

  if (!loading && allRules && allRules.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <p>
            还没有规则,去
            <Link to='alarm-management?locale=alarmRules'>添加</Link>
          </p>
        }
      />
    );
  }
  return (
    <Table
      rowKey='id'
      columns={columns}
      dataSource={allRules}
      expandable={{
        expandedRowRender: (record: AlarmRule) => <Table {...getRules(record.rules)} />
      }}
      size='small'
      pagination={false}
      loading={loading}
      locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='暂无数据' /> }}
    />
  );
};
