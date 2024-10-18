import { Col, Row } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import React, { useEffect, useState } from 'react';
import { RangeDatePicker, oneWeekNumberRange } from '../../components/rangeDatePicker';
import { Store, useStore } from '../../hooks/store';
import { Permission } from '../../permission/permission';
import { PageResult } from '../../types/page';
import { isMobile } from '../../utils/deviceDetection';
import request from '../../utils/request';
import { GetResponse } from '../../utils/response';
import TableLayout from '../layout/TableLayout';
import intl from 'react-intl-universal';
import { PageTitle } from '../../components/pageTitle';
import dayjs from '../../utils/dayjsUtils';
import { Link } from 'react-router-dom';
import { Report } from './detail/report';
import { Card } from '../../components';

export default function ReportList() {
  const [dataSource, setDataSource] = useState<PageResult<Report[]>>();
  const [range, setRange] = React.useState<[number, number]>(oneWeekNumberRange);
  const [store, setStore] = useStore('reportList');

  const fetchReports = (store: Store['reportList'], from: number, to: number) => {
    const {
      pagedOptions: { index, size }
    } = store;
    getReports(index, size, from, to).then(setDataSource);
  };

  useEffect(() => {
    if (range) {
      const [from, to] = range;
      fetchReports(store, from, to);
    }
  }, [store, range]);

  const columns = [
    {
      title: intl.get('NAME'),
      dataIndex: 'reportName',
      key: 'reportName',
      width: 400
    },
    {
      title: intl.get('REPORT_DATE'),
      dataIndex: 'reportDate',
      key: 'reportDate',
      render: (text: number) => dayjs.unix(text).local().format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: intl.get('OPERATION'),
      key: 'action',
      render: (text: any, record: any) => {
        // return (
        //   <a
        //     href='#!'
        //     onClick={(e) => {
        //       e.preventDefault();
        //       downloadReport(record.filename).then((res) => {
        //         if (res.status === 200) {
        //           const url = window.URL.createObjectURL(new Blob([res.data as any]));
        //           const link = document.createElement('a');
        //           link.href = url;
        //           link.setAttribute('download', `${record.name}.pdf`);
        //           document.body.appendChild(link);
        //           link.click();
        //         }
        //       });
        //     }}
        //   >
        //     {intl.get('DOWNLOAD')}
        //   </a>
        // );
        return (
          <Link to={`/reports/${record.id}`} state={record}>
            查看报告
          </Link>
        );
      }
    }
  ];

  return (
    <Content>
      <PageTitle items={[{ title: intl.get('MENU_REPORTS') }]} />
      <Card>
        <Row gutter={[0, 20]}>
          <Col span={24}>
            <RangeDatePicker onChange={setRange} />
          </Col>
          <Col span={24}>
            <TableLayout
              columns={columns}
              permissions={[Permission.FirmwareDelete]}
              dataSource={dataSource}
              onPageChange={(index, size) =>
                setStore((prev) => ({ ...prev, pagedOptions: { index, size } }))
              }
              simple={isMobile}
              scroll={isMobile ? { x: 900 } : undefined}
            />
          </Col>
        </Row>
      </Card>
    </Content>
  );
}

export function getReports(page: number, size: number, from: number, to: number) {
  return request.get<PageResult<Report[]>>('/reports', { page, size, from, to }).then(GetResponse);
}

export function downloadReport(filename: string) {
  return request.download<any>(`/reports/${filename}`);
}
