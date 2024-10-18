import React from 'react';
import { Row, Col } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import intl from 'react-intl-universal';
import { FilterableAlarmRecordTable } from '../../../components/alarm/filterableAlarmRecordTable';
import { PageTitle } from '../../../components/pageTitle';
import { Card } from '../../../components';

const AlarmRecordPage = () => {
  return (
    <Content>
      <PageTitle items={[{ title: intl.get('ALARM_RECORDS') }]} />
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
