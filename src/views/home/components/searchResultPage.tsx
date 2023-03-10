import { Col, Row, UploadProps } from 'antd';
import * as React from 'react';
import ShadowCard from '../../../components/shadowCard';
import { isMobile } from '../../../utils/deviceDetection';

export type SearchResult = {
  pageTitle?: React.ReactNode;
  filters?: JSX.Element[];
  results: React.ReactNode;
  uploads?: UploadProps[];
};
export const SearchResultPage: React.FC<SearchResult> = (props) => {
  const { pageTitle, filters, results } = props;
  return (
    <>
      {pageTitle}
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
