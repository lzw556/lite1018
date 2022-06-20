import { Button, ButtonProps, Col, Row, Space, Upload, UploadProps } from 'antd';
import * as React from 'react';
import MyBreadcrumb from '../../../components/myBreadcrumb';
import ShadowCard from '../../../components/shadowCard';

export type SearchResult = {
  actions?: ButtonProps[];
  filters?: JSX.Element[];
  results: JSX.Element[];
  uploads?: UploadProps[];
};
export const SearchResultPage: React.FC<SearchResult> = (props) => {
  const { actions, filters, results, uploads } = props;
  return (
    <>
      {actions && (
        <Row>
          <Col span={24}>
            <MyBreadcrumb>
              <Space>
                {actions && actions.map((action, index) => <Button key={`${index}-btn`} {...action} />)}
                {uploads && uploads.map((upload, index) => <Upload key={`${index}-upload`} {...upload} />)}
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
