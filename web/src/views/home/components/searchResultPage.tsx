import { Col, Row, Space, UploadProps } from 'antd';
import * as React from 'react';
import MyBreadcrumb from '../../../components/myBreadcrumb';
import ShadowCard from '../../../components/shadowCard';
import { isMobile } from '../../../utils/deviceDetection';

export type SearchResult = {
  actions?: React.ReactNode;
  filters?: JSX.Element[];
  results: React.ReactNode;
  uploads?: UploadProps[];
};
export const SearchResultPage: React.FC<SearchResult> = (props) => {
  const { actions, filters, results } = props;
  return (
    <>
      {actions && (
        <Row style={{flex: '0 0 42px'}}>
          <Col span={24}>
            <MyBreadcrumb fixed={true}>
              <Space wrap={true}>{actions}</Space>
            </MyBreadcrumb>
          </Col>
        </Row>
      )}
      <ShadowCard>
        <Row gutter={[0, 16]}>
          {filters && (
            <Col span={isMobile ? 20 : 8}>
              {filters.map((filter, index) => (
                <React.Fragment key={index}>{filter}</React.Fragment>
              ))}
            </Col>
          )}
          {results && <Col span={24}>{results}</Col>}
        </Row>
      </ShadowCard>
      {props.children}
    </>
  );
};
