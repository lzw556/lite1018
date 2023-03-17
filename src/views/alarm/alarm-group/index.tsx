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
import usePermission, { Permission } from '../../../permission/permission';
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

export default function AlarmRuleList() {
  const { hasPermission } = usePermission();
  const category = useAssetCategoryContext();
  const [visible, setVisible] = React.useState(false);
  const [visibleExport, setVisibleExport] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<AlarmRule>();
  let columns: any = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 400
    },
    {
      title: MONITORING_POINT_TYPE,
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (typeId: number) => {
        return MONITORING_POINTS.get(category)?.find((m) => m.id === typeId)?.label ?? '-';
      }
    }
  ];
  if (hasPermission(Permission.AlarmRuleGroupEdit)) {
    columns.push({
      title: '操作',
      key: 'action',
      render: (x: any, row: AlarmRule) => {
        return (
          <Space>
            {row.editable && (
              <>
                <HasPermission value={Permission.AlarmRuleGroupEdit}>
                  <Button type='text' size='small' title={`编辑`}>
                    <Link to={`${row.id}`}>
                      <EditOutlined />
                    </Link>
                  </Button>
                </HasPermission>
                <HasPermission value={Permission.AlarmRuleDelete}>
                  <Popconfirm
                    title={`确定要删除该规则吗?`}
                    onConfirm={() => {
                      deleteAlarmRule(row.id).then(() => {
                        fetchAlarmRules();
                      });
                    }}
                  >
                    <Button type='text' danger={true} size='small' title={`删除`}>
                      <DeleteOutlined />
                    </Button>
                  </Popconfirm>
                </HasPermission>
              </>
            )}
            <HasPermission value={Permission.AlarmRuleGroupBind}>
              <Button type='text' size='small' title={UPDATE_MONITORING_POINT}>
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
    });
  }
  const getRules = (dataSource: AlarmRule['rules']): TableProps<any> => {
    return {
      rowKey: 'id',
      columns: [
        { title: '子规则名称', dataIndex: 'name', key: 'name', width: 400 },
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
    locale: { emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='暂无数据' /> }
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
        items={[{ title: '报警规则' }]}
        actions={
          <>
            <HasPermission value={Permission.AlarmRuleGroupAdd}>
              <Link to='create'>
                <Button type='primary'>
                  添加规则
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
                  导出配置
                  <ExportOutlined />
                </Button>
              )}
            </HasPermission>
            <HasPermission value={Permission.AlarmRuleGroupImport}>
              <FileInput
                onUpload={(data) => {
                  return importAlarmRules(data).then((res) => {
                    if (res.data.code === 200) {
                      message.success('导入成功');
                      fetchAlarmRules();
                    } else {
                      message.error(`导入失败: ${res.data.msg}`);
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
