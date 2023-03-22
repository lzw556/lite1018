import { Button, Empty, Space, Spin, Table, TableProps, Tag } from 'antd';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { MONITORING_POINTS } from '../../../config/assetCategory.config';
import { isMobile } from '../../../utils/deviceDetection';
import {
  bindMeasurementsToAlarmRule,
  getAlarmRules,
  unbindMeasurementsToAlarmRule
} from '../../alarm/alarm-group/services';
import { AlarmRule } from '../../alarm/alarm-group/types';
import {
  convertAlarmLevelToState,
  getAlarmLevelColor,
  getAlarmStateText,
  useAssetCategoryContext
} from '../../asset';
import { MonitoringPointRow } from '../types';
import intl from 'react-intl-universal';

export const AlarmRuleSetting = (point: MonitoringPointRow) => {
  const [allRules, setAllRules] = React.useState<AlarmRule[]>();
  const [loading, setLoading] = React.useState(true);
  const category = useAssetCategoryContext();
  const getRules = (dataSource: AlarmRule['rules']): TableProps<any> => {
    return {
      rowKey: 'id',
      columns: [
        { title: intl.get('NAME'), dataIndex: 'name', key: 'name', width: 400 },
        {
          title: intl.get('ALARM_METRIC'),
          dataIndex: 'metric',
          key: 'metric',
          render: (metric: any) => metric.name,
          width: 120
        },
        {
          title: intl.get('ALARM_CONDITION'),
          dataIndex: 'condition',
          key: 'condition',
          render: (_: any, record: any) => {
            return `${record.operation} ${record.threshold} ${record.metric.unit}`;
          },
          width: 150
        },
        {
          title: intl.get('ALAMR_LEVEL'),
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
      style: { marginLeft: 20, width: 770 },
      scroll: isMobile ? { x: 600 } : undefined
    };
  };
  const columns = [
    {
      title: intl.get('STATUS'),
      dataIndex: 'bindedStatus',
      key: 'bindedStatus',
      width: 100,
      render: (status: boolean) => (
        <Tag color={status ? 'green' : 'geekblue'}>
          {status ? intl.get('BOUND') : intl.get('UNBOUND')}
        </Tag>
      )
    },
    {
      title: intl.get('NAME'),
      dataIndex: 'name',
      key: 'name',
      width: 400
    },
    {
      title: intl.get('MONITORING_POINT_TYPE'),
      dataIndex: 'type',
      key: 'type',
      width: 200,
      render: (typeId: number) => {
        const label = MONITORING_POINTS.get(category)?.find((m) => m.id === typeId)?.label;
        return label ? intl.get(label) : '-';
      }
    },
    {
      title: intl.get('OPERATION'),
      key: 'action',
      render: (_: any, row: AlarmRule) => {
        return (
          <Space>
            {row.bindedStatus ? (
              <Button
                type='link'
                size='small'
                title={intl.get('REMOVE')}
                danger={true}
                onClick={() => {
                  updateRow(row.id, { bindingStatus: true });
                  unbindMeasurementsToAlarmRule(row.id, { monitoring_point_ids: [point.id] }).then(
                    () => updateRow(row.id, { bindedStatus: false, bindingStatus: false })
                  );
                }}
              >
                {row.bindingStatus ? <Spin /> : intl.get('REMOVE')}
              </Button>
            ) : (
              <Button
                type='link'
                size='small'
                title={intl.get('BIND')}
                onClick={() => {
                  updateRow(row.id, { bindingStatus: true });
                  bindMeasurementsToAlarmRule(row.id, { monitoring_point_ids: [point.id] }).then(
                    () => updateRow(row.id, { bindedStatus: true, bindingStatus: false })
                  );
                }}
              >
                {row.bindingStatus ? <Spin /> : intl.get('BIND')}
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
    fetchAlarmRules(point.type);
  }, [point.type]);

  React.useEffect(() => {
    if (
      allRules &&
      allRules.length > 0 &&
      allRules.every(({ bindedStatus }) => bindedStatus === undefined || bindedStatus === null)
    ) {
      getAlarmRules(point.id).then((data) => {
        setAllRules(
          allRules.map((rule) => ({
            ...rule,
            bindedStatus: !!data.find(({ id }) => id === rule.id)
          }))
        );
      });
    }
  }, [point.id, allRules]);

  if (!loading && allRules && allRules.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <p>
            {intl.get('NO_RULES_PROMPT')}
            <Link to='alarmRules'>{intl.get('CREATE_ONE')}</Link>
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
      locale={{
        emptyText: (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={intl.get('NO_DATA_PROMPT')} />
        )
      }}
      scroll={isMobile ? { x: 600 } : undefined}
    />
  );
};
