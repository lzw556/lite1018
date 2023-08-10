import React from 'react';
import { Table } from 'antd';
import intl from 'react-intl-universal';
import { translateMetricName } from '../../alarm/alarm-group';
import dayjs from '../../../utils/dayjsUtils';
import { REPORT, Report } from './report';

export const AlarmPage = ({ report }: { report: Report }) => {
  const renderAlarmSummary = (alarmRecordsStat: Report['alarmRecordsStat']) => {
    if (alarmRecordsStat) {
      const { minorAlarmNum, majorAlarmNum, criticalAlarmNum, handledNum, unhandledNum } =
        alarmRecordsStat;
      const total = minorAlarmNum + majorAlarmNum + criticalAlarmNum;
      return (
        <p>
          本周共新增<span className='value'>{total}</span>
          条报警信息，其中
          <span className='value'>{criticalAlarmNum}</span>
          条为紧急报警信息，
          <span className='value'>{majorAlarmNum}</span>
          条为重要报警信息，
          <span className='value'>{minorAlarmNum}</span>
          条为次要报警信息，已处理
          <span className='value'>{handledNum}</span>
          条，还有<span className='value'>{unhandledNum}</span>
          条为未处理状态，请尽快处理并消除报警。
        </p>
      );
    }
    return null;
  };
  debugger;
  return (
    <section className='page'>
      <h3>{REPORT.alarm.title}</h3>
      {report.alarmRecords && report.alarmRecords.length > 0 ? (
        <>
          <Table
            bordered={true}
            columns={[
              {
                dataIndex: 'level',
                title: intl.get('ALARM_LEVEL'),
                render: (level: number) => {
                  switch (level) {
                    case 1:
                      return intl.get('ALARM_LEVEL_MINOR');
                    case 2:
                      return intl.get('ALARM_LEVEL_MAJOR');
                    case 3:
                      return intl.get('ALARM_LEVEL_CRITICAL');
                  }
                }
              },
              {
                dataIndex: 'source',
                title: intl.get('ALARM_SOURCE'),
                render: (source: any) => {
                  if (source) {
                    return source.name;
                  }
                  return intl.get('UNKNOWN_SOURCE');
                }
              },
              {
                dataIndex: 'metric',
                title: intl.get('ALARM_DETAIL'),
                render: (metric: any, record: any) => {
                  return `${translateMetricName(metric.name)} ${record.operation} ${
                    record.threshold
                  }${metric.unit} ${intl.get('ALARM_VALUE')}: ${record.value}${metric.unit}`;
                }
              },
              {
                dataIndex: 'createAt',
                title: intl.get('ALARM_TIMESTAMP'),
                render: (createdAt: number) => {
                  return dayjs.unix(createdAt).local().format('YYYY-MM-DD HH:mm:ss');
                }
              },
              {
                dataIndex: 'status',
                title: intl.get('ALARM_STATUS'),
                render: (status: number) => {
                  switch (status) {
                    case 1:
                      return intl.get('ALARM_STATUS_PROCESSED');
                    case 2:
                      return intl.get('ALARM_STATUS_AUTO_PROCESSED');
                    default:
                      return intl.get('ALARM_STATUS_UNPROCESSED');
                  }
                }
              }
            ]}
            dataSource={report.alarmRecords}
            pagination={false}
          />
          {renderAlarmSummary(report.alarmRecordsStat)}
        </>
      ) : (
        '暂无报警'
      )}
    </section>
  );
};
