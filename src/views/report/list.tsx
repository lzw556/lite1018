import { Col, Row } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import MyBreadcrumb from '../../components/myBreadcrumb';
import { RangeDatePicker } from '../../components/rangeDatePicker';
import ShadowCard from '../../components/shadowCard';
import { Store, useStore } from '../../hooks/store';
import { Permission } from '../../permission/permission';
import { PageResult } from '../../types/page';
import { isMobile } from '../../utils/deviceDetection';
import request from '../../utils/request';
import { GetResponse } from '../../utils/response';
import TableLayout from '../layout/TableLayout';
import intl from 'react-intl-universal';

export default function ReportList() {
  const [dataSource, setDataSource] = useState<PageResult<Report[]>>();
  const [range, setRange] = React.useState<[number, number]>();
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
      dataIndex: 'name',
      key: 'name',
      width: 400
    },
    {
      title: intl.get('REPORT_DATE'),
      dataIndex: 'reportDate',
      key: 'reportDate',
      render: (text: number) => moment.unix(text).local().format('yyyy-MM-DD')
    },
    {
      title: '操作',
      key: 'action',
      render: (text: any, record: any) => {
        return null;
      }
    }
  ];

  return (
    <Content>
      <MyBreadcrumb />
      <ShadowCard>
        <Row gutter={[0, 20]}>
          <Col span={24}>
            <RangeDatePicker
              onChange={useCallback((range: [number, number]) => setRange(range), [])}
            />
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
      </ShadowCard>
    </Content>
  );
}

export function getReports(page: number, size: number, from: number, to: number) {
  return request.get<PageResult<Report[]>>('/reports', { page, size, from, to }).then(GetResponse);
}

type Report = {
  id: number;
  start: number;
  end: number;
  filename: string;
  name: string;
  reportDate: number;
};
