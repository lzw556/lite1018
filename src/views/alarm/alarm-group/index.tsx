import {
  DeleteOutlined,
  EditOutlined,
  ExportOutlined,
  MoreOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { Button, Empty, message, Popconfirm, Space, Table, TableProps, Tag } from 'antd';
import { Content } from 'antd/es/layout/layout';
import * as React from 'react';
import { PageTitle } from '../../../components/pageTitle';
import { MONITORING_POINTS, useAssetCategoryChain } from '../../../config/assetCategory.config';
import HasPermission from '../../../permission';
import { Permission } from '../../../permission/permission';
import {
  convertAlarmLevelToState,
  getAlarmLevelColor,
  getAlarmStateText
} from '../../asset/common/statisticsHelper';
import { useAppConfigContext } from '../../asset/components/appConfigContext';
import { FileInput } from '../../asset/components/fileInput';
import { BindMonitoringPoints } from './bindMonitoringPoints';
import { SelectRules } from './selectRules';
import { deleteAlarmRule, getAlarmRules, importAlarmRules } from './services';
import { AlarmRule } from './types';
import intl from 'react-intl-universal';
import { MONITORING_POINT } from '../../monitoring-point';
import { AssertAssetCategory, AssertOfAssetCategory } from '../../asset';
import { BindMonitoringPoints2 } from './bindMonitoringPoints2';
import { SelfLink } from '../../../components/selfLink';
import { isMobile } from '../../../utils/deviceDetection';
import { getValue } from '../../../utils/format';

export default function AlarmRuleList() {
  const config = useAppConfigContext();
  const { root } = useAssetCategoryChain();
  const [open, setVisible] = React.useState(false);
  const [openExport, setVisibleExport] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<AlarmRule>();
  const columns = [
    {
      title: intl.get('NAME'),
      dataIndex: 'name',
      key: 'name',
      width: 400,
      render: (name: string) => intl.get(name).d(name)
    },
    {
      title: intl.get('OBJECT_TYPE', { object: intl.get(MONITORING_POINT) }),
      dataIndex: 'type',
      key: 'type',
      width: 200,
      render: (typeId: number) => {
        const label = MONITORING_POINTS.get(config.type)?.find((m) => m.id === typeId)?.label;
        return label ? intl.get(label) : '-';
      }
    },
    {
      title: intl.get('OPERATION'),
      key: 'action',
      render: (x: any, row: AlarmRule) => {
        return (
          <Space>
            {row.editable && (
              <>
                <Button type='text' size='small' title={intl.get('EDIT')}>
                  <SelfLink to={`${row.id}`}>
                    <EditOutlined />
                  </SelfLink>
                </Button>
                <HasPermission value={Permission.AlarmRuleDelete}>
                  <Popconfirm
                    title={intl.get('DELETE_RULE_PROMPT')}
                    onConfirm={() => {
                      deleteAlarmRule(row.id).then(() => {
                        fetchAlarmRules();
                      });
                    }}
                  >
                    <Button type='text' danger={true} size='small' title={intl.get('DELETE')}>
                      <DeleteOutlined />
                    </Button>
                  </Popconfirm>
                </HasPermission>
              </>
            )}
            <HasPermission value={Permission.AlarmRuleGroupBind}>
              <Button
                type='text'
                size='small'
                title={intl.get('EDIT_SOMETHING', { something: intl.get(MONITORING_POINT) })}
              >
                <MoreOutlined
                  onClick={() => {
                    setSelectedRow(row);
                    setVisible(true);
                  }}
                />
              </Button>
            </HasPermission>
          </Space>
        );
      }
    }
  ];

  const getRules = (dataSource: AlarmRule['rules']): TableProps<any> => {
    return {
      rowKey: 'id',
      columns: [
        {
          title: intl.get('NAME'),
          dataIndex: 'name',
          key: 'name',
          width: 400,
          render: (name: string) => intl.get(name).d(name)
        },
        {
          title: intl.get('ALARM_METRIC'),
          dataIndex: 'metric',
          key: 'metric',
          render: (metric: any) => {
            return translateMetricName(metric.name);
          },
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
          title: intl.get('ALARM_LEVEL'),
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
      style: { marginLeft: 40, width: columns.length === 2 ? 'auto' : 770 },
      scroll: isMobile ? { x: 600 } : undefined
    };
  };

  const [result, setResult] = React.useState<TableProps<any>>({
    rowKey: 'id',
    columns,
    expandable: {
      expandedRowRender: (record: AlarmRule) => <Table {...getRules(record.rules)} />
    },
    size: 'small',
    pagination: false,
    loading: true,
    locale: {
      emptyText: (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={intl.get('NO_DATA_PROMPT')} />
      )
    },
    scroll: isMobile ? { x: 600 } : undefined
  });

  const fetchAlarmRules = () => {
    setResult((prev) => ({ ...prev, loading: true }));
    getAlarmRules().then((data) => {
      setResult((prev) => ({ ...prev, loading: false, dataSource: data }));
    });
  };

  React.useEffect(() => {
    fetchAlarmRules();
  }, []);

  return (
    <Content>
      <PageTitle
        items={[{ title: intl.get('ALARM_RULES') }]}
        actions={
          <>
            <HasPermission value={Permission.AlarmRuleGroupAdd}>
              <SelfLink to='create'>
                <Button type='primary'>
                  {intl.get('CREATE_ALARM_RULE')}
                  <PlusOutlined />
                </Button>
              </SelfLink>
            </HasPermission>
            <HasPermission value={Permission.AlarmRuleGroupExport}>
              {result.dataSource && result.dataSource.length > 0 && (
                <Button
                  type='primary'
                  onClick={() => {
                    setVisibleExport(true);
                  }}
                >
                  {intl.get('EXPORT_SETTINGS')}
                  <ExportOutlined />
                </Button>
              )}
            </HasPermission>
            <HasPermission value={Permission.AlarmRuleGroupImport}>
              <FileInput
                onUpload={(data) => {
                  return importAlarmRules(data).then((res) => {
                    if (res.data.code === 200) {
                      message.success(intl.get('IMPORTED_SUCCESSFUL'));
                      fetchAlarmRules();
                    } else {
                      message.error(
                        `${intl.get('FAILED_TO_IMPORT')}${intl.get(res.data.msg).d(res.data.msg)}`
                      );
                    }
                  });
                }}
              />
            </HasPermission>
            {openExport && (
              <SelectRules
                open={openExport}
                onCancel={() => setVisibleExport(false)}
                rules={result.dataSource as AlarmRule[]}
                onSuccess={() => setVisibleExport(false)}
              />
            )}
          </>
        }
      />
      <Table {...result} />
      {open && selectedRow && AssertAssetCategory(root.key, AssertOfAssetCategory.IS_WIND_LIKE) && (
        <BindMonitoringPoints
          {...{
            open: open,
            onCancel: () => setVisible(false),
            selectedRow,
            onSuccess: () => {
              setVisible(false);
              fetchAlarmRules();
            }
          }}
        />
      )}
      {open && selectedRow && !AssertAssetCategory(root.key, AssertOfAssetCategory.IS_WIND_LIKE) && (
        <BindMonitoringPoints2
          {...{
            open: open,
            onCancel: () => setVisible(false),
            selectedRow,
            onSuccess: () => {
              setVisible(false);
              fetchAlarmRules();
            }
          }}
        />
      )}
    </Content>
  );
}

export function translateMetricName(name: string) {
  if (!name) return name;
  if (name.indexOf(':')) {
    return name
      .split(':')
      .map((n) => intl.get(n))
      .join(':');
  } else {
    return intl.get(name);
  }
}

export function getAlarmDetail(
  record: { operation: string; threshold: number; value: number },
  metric: {
    name: string;

    unit: string;
    value: number;
  }
) {
  const { operation, threshold, value } = record;
  const { name, unit } = metric;
  const thres = getValue(threshold, unit);
  const alarmValue = getValue(value, unit);
  return `${translateMetricName(name)} ${operation} ${thres} ${intl.get(
    'ALARM_VALUE'
  )}: ${alarmValue}`;
}
