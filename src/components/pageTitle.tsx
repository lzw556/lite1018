import { Breadcrumb, Col, Row, Space } from 'antd';
import React from 'react';

export const PageTitle = ({
  items,
  actions
}: {
  items?: { title: React.ReactNode }[];
  actions?: React.ReactNode;
}) => {
  return (
    <Row justify='space-between' align='middle' style={{ marginBottom: 10 }}>
      <Col>
        {items && <Breadcrumb items={items} style={{ fontSize: 16, fontWeight: 'bold' }} />}
      </Col>
      {actions && (
        <Col>
          <Space>{actions}</Space>
        </Col>
      )}
    </Row>
  );
};
