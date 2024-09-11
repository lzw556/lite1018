import React from 'react';
import { Table } from 'antd';
import intl from 'react-intl-universal';
import { getAlarmDetail } from '../../alarm/alarm-group';
import dayjs from '../../../utils/dayjsUtils';
import { Report } from './report';

const PAGE_ROWS = 15;
const TITLE_ROWS = 2;
const TABLE_HEADER_ROWS = 1;
const SPLIT_ROWS = 1;
const SUMMARY_ROWS = 3;
const TITLE = '二、	本周报警';

export const AlarmPage = ({ report }: { report: Report }) => {
  const dataSource = report.alarmRecords ?? [];
  const dataSource2: any = [];

  const getPageMetaOfAlarmRecords = () => {
    const initialUsedNums = TITLE_ROWS + TABLE_HEADER_ROWS;
    const chunks = chunkList(dataSource, PAGE_ROWS - initialUsedNums);
    const usedNums = getUsedRowNumsOnLastPage(chunks, initialUsedNums);
    const shouldMixNext = PAGE_ROWS - usedNums >= SUMMARY_ROWS;
    return { initialUsedNums, chunks, usedNums, shouldMixNext };
  };

  const getPageMetaOfPoints = () => {
    const top = getPageMetaOfAlarmRecords();
    const initialUsedNums = top.shouldMixNext ? top.usedNums + SPLIT_ROWS + TABLE_HEADER_ROWS : 0;
    const chunks = chunkList(dataSource2, PAGE_ROWS - initialUsedNums);
    const usedNums = getUsedRowNumsOnLastPage(chunks, initialUsedNums);
    const shouldMixNext = PAGE_ROWS - usedNums >= SUMMARY_ROWS;
    return { initialUsedNums, chunks, usedNums, shouldMixNext };
  };

  const getUsedRowNumsOnLastPage = <T,>(chunks: T[][], staticRowNums = 0) => {
    if (chunks.length === 0) {
      return staticRowNums;
    }
    const last = chunks[chunks.length - 1];
    return (chunks.length === 1 ? staticRowNums : 0) + last.length;
  };

  const renderPages = () => {
    const top = getPageMetaOfAlarmRecords();
    const middle = getPageMetaOfPoints();
    let shouldMixSummary = false;
    if (middle.chunks.length === 0) {
      shouldMixSummary = top.shouldMixNext;
    } else if (middle.shouldMixNext) {
      shouldMixSummary = middle.shouldMixNext;
    }
    const topPages = top.chunks.map((p: any, index: number) => {
      const isLast = index === top.chunks.length - 1;
      return (
        <section className='page alarm'>
          {index === 0 && <h3>{TITLE}</h3>}
          <AlarmRecordTable dataSource={p} showHeader={index === 0} />
          {top.shouldMixNext && isLast && (
            <>
              {middle.chunks.length > 0 && (
                <AlarmRecordTable dataSource={middle.chunks[0]} showHeader={true} />
              )}
              {shouldMixSummary &&
                middle.chunks.length <= 1 &&
                renderSummary(report.alarmRecordsStat)}
            </>
          )}
        </section>
      );
    });
    const middlePages = middle.chunks.map((p: any, index: number) => {
      const isLast = index === middle.chunks.length - 1;
      if (top.shouldMixNext && index === 0) {
        return null;
      }
      return (
        <section className='page alarm'>
          <AlarmRecordTable dataSource={p} showHeader={index === 0} />
          {shouldMixSummary && isLast && renderSummary(report.alarmRecordsStat)}
        </section>
      );
    });
    const summaryPage = !shouldMixSummary && (
      <section className='page alarm'>{renderSummary(report.alarmRecordsStat)}</section>
    );
    return (
      <>
        {topPages}
        {middlePages}
        {summaryPage}
      </>
    );
  };

  const renderSummary = (alarmRecordsStat: Report['alarmRecordsStat']) => {
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
          条为普通报警信息，已处理
          <span className='value'>{handledNum}</span>
          条，还有<span className='value'>{unhandledNum}</span>
          条为未处理状态，请尽快处理并消除报警。
        </p>
      );
    }
    return null;
  };
  if (!dataSource || dataSource.length === 0) {
    return (
      <section className='page'>
        <h3>{TITLE}</h3>
        <p>暂无报警</p>
      </section>
    );
  }
  return renderPages();
};

function chunkList<T>(list: T[], firstChunkSize: number, skipFirst = false) {
  const res: T[][] = [];
  let index = 0;
  while (index < list.length) {
    let size = PAGE_ROWS;
    if (index === 0) {
      size = firstChunkSize;
    }
    if (!skipFirst || index !== 0) {
      res.push(list.slice(index, size + index));
    }
    index += size;
  }
  return res;
}

function AlarmRecordTable<T>({
  dataSource,
  showHeader = true
}: {
  dataSource: T[];
  showHeader: boolean;
}) {
  return (
    <Table
      className='alarm-record-table'
      bordered={true}
      columns={[
        {
          dataIndex: 'level',
          title: intl.get('ALARM_LEVEL'),
          width: 50,
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
          render: (metric: any, record: any) => getAlarmDetail(record, metric)
        },
        {
          dataIndex: 'createdAt',
          width: 90,
          title: intl.get('ALARM_TIMESTAMP'),
          render: (createdAt: number) => {
            return dayjs.unix(createdAt).local().format('YYYY-MM-DD HH:mm:ss');
          }
        },
        {
          dataIndex: 'status',
          width: 60,
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
      dataSource={dataSource}
      showHeader={showHeader}
      size='small'
      pagination={false}
    />
  );
}
