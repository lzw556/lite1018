import { DeleteOutlined, EditOutlined, MoreOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Empty, Popconfirm, Space, Table, TableProps, Tag } from 'antd';
import * as React from 'react';
import { MeasurementTypes } from '../../common/constants';
import {
  convertAlarmLevelToState,
  getAlarmLevelColor,
  getAlarmStateText
} from '../../common/statisticsHelper';
import { SearchResultPage } from '../../components/searchResultPage';
import { AlarmRule } from '../props';
import { getAlarmRules } from '../services';
import { MeasurementBind } from './measurementBind';

const AlarmRuleList = () => {
  const [visible, setVisible] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<AlarmRule>();
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
  const [result, setResult] = React.useState<TableProps<any>>({
    rowKey: (row: any) => `${row.id}-${row.type}`,
    columns: [
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
        render: (x, row: AlarmRule) => {
          return (
            <Space>
              <Button type='text' size='small' title={`编辑`}>
                <EditOutlined />
              </Button>
              <Popconfirm
                title={`确定要删除该吗?`}
                // onConfirm={() => {
                //   deleteAsset(row.id).then(() => {
                //     fetchAssets({ type: AssetTypes.WindTurbind.id });
                //   });
                // }}
              >
                <Button type='text' danger={true} size='small' title={`删除`}>
                  <DeleteOutlined />
                </Button>
              </Popconfirm>
              <Button type='text' size='small' title='编辑监测点'>
                <MoreOutlined
                  onClick={() => {
                    setSelectedRow(row);
                    setVisible(true);
                  }}
                />
              </Button>
            </Space>
          );
        }
      }
    ],
    expandable: {
      expandedRowRender: (record: AlarmRule) => <Table {...getRules(record.rules)} />
    },
    size: 'small',
    pagination: false,
    loading: true,
    locale: { emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='暂无数据' /> }
  });

  React.useEffect(() => {
    getAlarmRules().then((data) => {
      setResult((prev) => ({ ...prev, loading: false, dataSource: data }));
    });
  }, []);

  return (
    <SearchResultPage
      {...{
        actions: [
          {
            type: 'primary',
            children: React.Children.toArray(['添加规则', <PlusOutlined />]),
            href: '#/alarm-management?locale=alarmRules/addAlarmRuleGroup'
          }
        ],
        results: [<Table {...result} />]
      }}
    >
      {visible && (
        <MeasurementBind
          {...{
            visible,
            onCancel: () => setVisible(false),
            selectedRow
          }}
        />
      )}
    </SearchResultPage>
  );
};

export default AlarmRuleList;
