import { Card, Row, Col } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import React from 'react';
import { FilterableAlarmRecordTable } from '../../../components/alarm/filterableAlarmRecordTable';
import { PageTitle } from '../../../components/pageTitle';

const AlarmRecordPage = () => {
  return (
    <Content>
      <PageTitle items={[{ title: '报警记录' }]} />
      <Row justify='center'>
        <Col span={24}>
          <Card>
            <FilterableAlarmRecordTable />
          </Card>
        </Col>
      </Row>
    </Content>
  );
};

export default AlarmRecordPage;
