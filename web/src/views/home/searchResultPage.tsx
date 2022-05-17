import { Button, Col, Form, Row, Space, Table } from 'antd';
import * as React from 'react';
import MyBreadcrumb from '../../components/myBreadcrumb';
import ShadowCard from '../../components/shadowCard';
import { SearchResult } from './props';

export const SearchResultPage: React.FC<SearchResult> = (props) => {
  const { actions, filters, result } = props;
  return (
    <>
      {actions && (
        <Row>
          <Col span={24}>
            <MyBreadcrumb>
              <Space>
                {actions.map((action, index) => (
                  <Button key={index} {...action} />
                ))}
              </Space>
            </MyBreadcrumb>
          </Col>
        </Row>
      )}
      <ShadowCard>
        <Row gutter={[0, 16]}>
          {filters && (
            <Col span={24}>
              {filters.map((filter, index) => (
                <Form.Item key={index} {...filter} />
              ))}
            </Col>
          )}
          <Col span={24}>
            <Table {...result} />
          </Col>
        </Row>
      </ShadowCard>
      {props.children}
    </>
  );
};
