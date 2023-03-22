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
import { Link } from 'react-router-dom';
import { PageTitle } from '../../../components/pageTitle';
import { MONITORING_POINTS } from '../../../config/assetCategory.config';
import HasPermission from '../../../permission';
import { Permission } from '../../../permission/permission';
import {
  convertAlarmLevelToState,
  getAlarmLevelColor,
  getAlarmStateText
} from '../../asset/common/statisticsHelper';
import { useAssetCategoryContext } from '../../asset/components/assetCategoryContext';
import { FileInput } from '../../asset/components/fileInput';
import { MONITORING_POINT_TYPE, UPDATE_MONITORING_POINT } from '../../monitoring-point';
import { BindMonitoringPoints } from './bindMonitoringPoints';
import { SelectRules } from './selectRules';
import { deleteAlarmRule, getAlarmRules, importAlarmRules } from './services';
import { AlarmRule } from './types';
import intl from 'react-intl-universal';

export default function AlarmRuleList() {
  const category = useAssetCategoryContext();
  const [visible, setVisible] = React.useState(false);
  const [visibleExport, setVisibleExport] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<AlarmRule>();
  const columns = [
    {
      title: intl.get('NAME'),
      dataIndex: 'name',
      key: 'name',
      width: 400,
      render: (_: any, record: any) => {
        return intl.get(record.name).d(record.name);
      }
    },
    {
      title: intl.get(MONITORING_POINT_TYPE),
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
      render: (x: any, row: AlarmRule) => {
        return (
          <Space>
            {row.editable && (
              <>
                <Button type='text' size='small' title={intl.get('EDIT')}>
                  <Link to={`${row.id}`}>
                    <EditOutlined />
                  </Link>
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
              <Button type='text' size='small' title={intl.get(UPDATE_MONITORING_POINT)}>
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
          title: intl.get('ALARM_SUB_RULE_NAME'),
          dataIndex: 'name',
          key: 'name',
          width: 400,
          render: (_: any, record: any) => {
            return intl.get(record.name).d(record.name);
          }
        },
        {
          title: intl.get('ALARM_METRIC'),
          dataIndex: 'metric',
          key: 'metric',
          render: (metric: any) => {
            return intl.get(metric.name).d(metric.name);
          },
          width: 120
        },
        {
          title: intl.get('ALARM_CONDITION'),
          dataIndex: 'condition',
          key: 'condition',
          render: (_: any, record: any) => {
            return `${record.operation} ${record.threshold} ${
              record.metric.unit ? intl.get(record.metric.unit).d(record.metric.unit) : ''
            }`;
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
      style: { marginLeft: 40, width: columns.length === 2 ? 'auto' : 770 }
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
    }
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
              <Link to='create'>
                <Button type='primary'>
                  {intl.get('CREATE_ALARM_RULE')}
                  <PlusOutlined />
                </Button>
              </Link>
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
            {visibleExport && (
              <SelectRules
                open={visibleExport}
                onCancel={() => setVisibleExport(false)}
                rules={result.dataSource as AlarmRule[]}
                onSuccess={() => setVisibleExport(false)}
              />
            )}
          </>
        }
      />
      <Table {...result} />
      {visible && selectedRow && (
        <BindMonitoringPoints
          {...{
            open: visible,
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
