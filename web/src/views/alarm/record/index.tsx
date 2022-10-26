import { Card, Row, Col } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import React from 'react';
import { FilterableAlarmRecordTable } from '../../../components/alarm/filterableAlarmRecordTable';
import MyBreadcrumb from '../../../components/myBreadcrumb';

const AlarmRecordPage = () => {
  return (
    <Content>
      <MyBreadcrumb />
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
