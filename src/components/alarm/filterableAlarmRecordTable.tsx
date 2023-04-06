import * as React from 'react';
import { PageResult } from '../../types/page';
import dayjs from '../../utils/dayjsUtils';
import {
  GetAlarmRecordAcknowledgeRequest,
  PagingAlarmRecordRequest,
  RemoveAlarmRecordRequest
} from '../../apis/alarm';
import { Button, Col, Popconfirm, Row, Select, Space, Tag, Tree } from 'antd';
import { ColorDanger, ColorInfo, ColorWarn } from '../../constants/color';
import { DeleteOutlined } from '@ant-design/icons';
import TableLayout from '../../views/layout/TableLayout';
import { isMobile } from '../../utils/deviceDetection';
import AcknowledgeModal from '../../views/alarm/record/acknowledgeModal';
import AcknowledgeViewModal from '../../views/alarm/record/acknowledgeViewModal';
import HasPermission from '../../permission';
import { Permission } from '../../permission/permission';
import Label from '../label';
import { RangeDatePicker } from '../rangeDatePicker';
import { Store, useStore } from '../../hooks/store';
import intl from 'react-intl-universal';
import { translateMetricName } from '../../views/alarm/alarm-group';

const { Option } = Select;

export const FilterableAlarmRecordTable: React.FC<{ sourceId?: number }> = ({ sourceId }) => {
  const [dataSource, setDataSource] = React.useState<PageResult<any[]>>();
  const [alarmRecord, setAlarmRecord] = React.useState<any>();
  const [acknowledge, setAcknowledge] = React.useState<any>();
  const [status, setStatus] = React.useState<any>([0, 1, 2]);
  const [store, setStore, gotoPage] = useStore('alarmRecordList');

  const fetchAlarmRecords = (status: any, store: Store['alarmRecordList'], sourceId?: number) => {
    const {
      pagedOptions: { index, size },
      alertLevels,
      range
    } = store;
    const filters: any = {
      levels: alertLevels.join(','),
      status: ''
    };
    if (status && status.length > 0) {
      filters.status = status.join(',');
    }
    if (range) {
      const [from, to] = range;
      PagingAlarmRecordRequest(index, size, from, to, filters, sourceId).then((res) => {
        setDataSource({
          page: res.page,
          size: res.size,
          total: res.total,
          result: res.result.sort(
            (prev: any, next: any) => prev.alarmRuleGroupId - next.alarmRuleGroupId
          )
        });
      });
    }
  };

  React.useEffect(() => {
    fetchAlarmRecords(status, store, sourceId);
  }, [status, sourceId, store]);

  const onDelete = (id: number) => {
    RemoveAlarmRecordRequest(id).then((_) => {
      if (dataSource) {
        const { size, page, total } = dataSource;
        gotoPage({ size, total, index: page }, 'prev');
      }
    });
  };

  const onAcknowledge = (record: any) => {
    setAlarmRecord(record);
  };

  const onViewAcknowledge = (id: number) => {
    GetAlarmRecordAcknowledgeRequest(id).then(setAcknowledge);
  };

  const renderFilterDropdown = ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => {
    const data = {
      title: intl.get('SELECT_ALL'),
      key: -1,
      children: [
        {
          title: intl.get('ALARM_STATUS_UNPROCESSED'),
          key: 0
        },
        {
          title: intl.get('ALARM_STATUS_PROCESSED'),
          key: 1
        },
        {
          title: intl.get('ALARM_STATUS_AUTO_PROCESSED'),
          key: 2
        }
      ]
    };
    return (
      <div style={{ padding: '4px 4px' }}>
        <Row justify={'start'}>
          <Col span={24}>
            <Tree
              treeData={[data]}
              selectable={false}
              checkable
              defaultExpandAll
              checkedKeys={status}
              showLine={false}
              showIcon={false}
              onCheck={(checkKeys: any, e: any) => {
                setStatus(checkKeys.filter((key: any) => key !== -1));
              }}
            />
          </Col>
        </Row>
      </div>
    );
  };

  const columns: any = [
    {
      title: intl.get('ALARM_NAME'),
      dataIndex: 'alarmRuleGroupName',
      key: 'alarmRuleGroupName',
      width: '15%',
      render: (name: string, record: any) => {
        return record.alarmRuleGroupId === 0 ? '已删除' : name;
      }
    },
    {
      title: intl.get('ALARM_LEVEL'),
      dataIndex: 'level',
      key: 'level',
      width: '8%',
      render: (level: number) => {
        switch (level) {
          case 1:
            return <Tag color={ColorInfo}>{intl.get('ALARM_LEVEL_MINOR')}</Tag>;
          case 2:
            return <Tag color={ColorWarn}>{intl.get('ALARM_LEVEL_MAJOR')}</Tag>;
          case 3:
            return <Tag color={ColorDanger}>{intl.get('ALARM_LEVEL_CRITICAL')}</Tag>;
        }
      }
    },
    // {
    //     title: '资源指标',
    //     dataIndex: 'source',
    //     key: 'type',
    //     width: '10%',
    //     render: (source: any) => {
    //         if (source) {
    //             return DeviceType.toString(source.typeId)
    //         }
    //         return "未知指标"
    //     }
    // },
    {
      title: intl.get('ALARM_SOURCE'),
      dataIndex: 'source',
      key: 'source',
      width: '10%',
      render: (source: any, record: any) => {
        if (source) {
          return source.name;
        }
        return intl.get('UNKNOWN_SOURCE');
      }
    },
    {
      title: intl.get('ALARM_DETAIL'),
      dataIndex: 'metric',
      key: 'metric',
      width: '15%',
      render: (metric: any, record: any) => {
        return `${translateMetricName(metric.name)} ${record.operation} ${record.threshold}${
          metric.unit
        } ${intl.get('ALARM_VALUE')}: ${record.value}${metric.unit}`;
      }
    },
    {
      title: intl.get('ALARM_TIMESTAMP'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '15%',
      render: (createdAt: number) => {
        return dayjs.unix(createdAt).local().format('YYYY-MM-DD HH:mm:ss');
      }
    },
    {
      title: intl.get('ALARM_DURATION'),
      dataIndex: 'duration',
      key: 'duration',
      width: '10%',
      render: (_: any, record: any) => {
        switch (record.status) {
          case 1:
          case 2:
            return dayjs
              .unix(record.createdAt)
              .local()
              .from(dayjs.unix(record.updatedAt).local(), true);
          default:
            return dayjs.unix(record.createdAt).local().fromNow(true);
        }
      }
    },
    {
      title: intl.get('ALARM_STATUS'),
      dataIndex: 'status',
      key: 'status',
      width: '5%',
      filterDropdown: renderFilterDropdown,
      render: (status: number) => {
        switch (status) {
          case 1:
            return <Tag color='blue'>{intl.get('ALARM_STATUS_PROCESSED')}</Tag>;
          case 2:
            return <Tag color='green'>{intl.get('ALARM_STATUS_AUTO_PROCESSED')}</Tag>;
          default:
            return <Tag>{intl.get('ALARM_STATUS_UNPROCESSED')}</Tag>;
        }
      }
    },
    {
      title: intl.get('OPERATION'),
      key: 'action',
      width: 64,
      // fixed: 'right',
      render: (_: any, record: any) => {
        return (
          <Space>
            {record.status === 0 ? (
              <HasPermission value={Permission.AlarmRecordAcknowledge}>
                <Button type='link' ghost size={'small'} onClick={() => onAcknowledge(record)}>
                  {intl.get('MARK_PROCESSED')}
                </Button>
              </HasPermission>
            ) : (
              <HasPermission value={Permission.AlarmRecordAcknowledgeGet}>
                <Button
                  disabled={record.status === 2}
                  type='link'
                  ghost
                  size={'small'}
                  onClick={() => onViewAcknowledge(record.id)}
                >
                  {intl.get('ALARM_PROCESSING_DETAIL')}
                </Button>
              </HasPermission>
            )}
            <HasPermission value={Permission.AlarmRecordDelete}>
              <Popconfirm
                placement='left'
                title={intl.get('DELETE_ALARM_RECORD_PROMPT')}
                onConfirm={() => onDelete(record.id)}
                okText={intl.get('DELETE')}
                cancelText={intl.get('CANCEL')}
              >
                <Button type='text' size='small' icon={<DeleteOutlined />} danger />
              </Popconfirm>
            </HasPermission>
          </Space>
        );
      }
    }
  ];

  return (
    <>
      <Row justify={'start'}>
        <Col span={24}>
          <Space direction={isMobile ? 'vertical' : 'horizontal'}>
            <Label name={intl.get('ALARM_LEVEL')}>
              <Select
                bordered={false}
                mode={'multiple'}
                value={store.alertLevels}
                style={{ width: 260 }}
                onChange={(value) => {
                  if (value.length) {
                    setStore((prev) => ({ ...prev, alertLevels: value }));
                  } else {
                    setStore((prev) => ({ ...prev, alertLevels: [1, 2, 3] }));
                  }
                }}
              >
                <Option key={1} value={1}>
                  {intl.get('ALARM_LEVEL_MINOR')}
                </Option>
                <Option key={2} value={2}>
                  {intl.get('ALARM_LEVEL_MAJOR')}
                </Option>
                <Option key={3} value={3}>
                  {intl.get('ALARM_LEVEL_CRITICAL')}
                </Option>
              </Select>
            </Label>
            <RangeDatePicker
              defaultRange={[dayjs.unix(store.range[0]), dayjs.unix(store.range[1])]}
              onChange={React.useCallback(
                (range: [number, number]) => {
                  setStore((prev) => {
                    if (
                      prev.range &&
                      range &&
                      prev.range.length === 2 &&
                      range.length === prev.range.length &&
                      range[1] === prev.range[1] &&
                      range[0] === prev.range[0]
                    ) {
                      return prev;
                    } else {
                      return { ...prev, range };
                    }
                  });
                },
                [setStore]
              )}
            />
          </Space>
        </Col>
      </Row>
      <br />
      <Row justify={'start'}>
        <Col span={24}>
          <TableLayout
            emptyText={intl.get('NO_ALARM_RECORDS_PROMPT')}
            columns={columns}
            dataSource={dataSource}
            onPageChange={(index, size) =>
              setStore((prev) => ({ ...prev, pagedOptions: { index, size } }))
            }
            simple={isMobile}
            scroll={isMobile ? { x: 1200 } : undefined}
          />
        </Col>
      </Row>
      {alarmRecord && (
        <AcknowledgeModal
          open={alarmRecord}
          record={alarmRecord}
          onCancel={() => setAlarmRecord(undefined)}
          onSuccess={() => {
            setAlarmRecord(undefined);
            fetchAlarmRecords(status, store, sourceId);
          }}
        />
      )}
      {acknowledge && (
        <AcknowledgeViewModal
          open={acknowledge}
          acknowledge={acknowledge}
          onCancel={() => setAcknowledge(undefined)}
        />
      )}
    </>
  );
};
