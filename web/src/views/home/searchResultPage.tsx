import { Button, Col, Row, Space } from 'antd';
import * as React from 'react';
import MyBreadcrumb from '../../components/myBreadcrumb';
import ShadowCard from '../../components/shadowCard';
import { SearchResult } from './props';

export const SearchResultPage: React.FC<SearchResult> = (props) => {
  const { actions, filters, results } = props;
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
            <Col span={8}>
              {filters.map((filter, index) => (
                <React.Fragment key={index}>{filter}</React.Fragment>
              ))}
            </Col>
          )}
          {results &&
            results.map((result, index) => (
              <Col key={index} span={24}>
                {result}
              </Col>
            ))}
        </Row>
      </ShadowCard>
      {props.children}
    </>
  );
};
