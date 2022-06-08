import { Col, Row, Statistic, Table } from 'antd';
import * as React from 'react';
import ShadowCard from '../../components/shadowCard';
import { ChartContainer } from './charts/chartContainer';
import './home.css';
import { IntroductionPage } from './introductionPage';
import { Overview } from './props';
import { generateColProps } from './utils';

export const OverviewPage: React.FC<Overview> = (props) => {
  const { statistics, chartList, introductionList, tabelList } = props;
  const colProps = generateColProps({ md: 12, lg: 12, xl: 4, xxl: 4 });
  const colProps2 = generateColProps({ md: 12, lg: 12, xl: 8, xxl: 6 });

  return (
    <Row gutter={[0, 16]}>
      {statistics && (
        <Col span={24}>
          <ShadowCard>
            <Row>
              {statistics.map(({ name, value }, index) => (
                <Col span={4} key={index} {...colProps}>
                  <Statistic title={name} value={value} />
                </Col>
              ))}
            </Row>
          </ShadowCard>
        </Col>
      )}
      {chartList && (
        <Col span={24}>
          <ShadowCard>
            <Row>
              {chartList.map(({ colProps, options, title, style, emptyDescription }, index) => {
                let content = null;
                if (options) {
                  content = <ChartContainer title={title} options={options} style={style} />;
                } else {
                  content = (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        height: '100%'
                      }}
                    >
                      <p style={{ textAlign: 'center' }}>{emptyDescription || '暂无数据'}</p>
                    </div>
                  );
                }
                return (
                  <React.Fragment key={index}>
                    <Col {...colProps}>{content}</Col>
                  </React.Fragment>
                );
              })}
            </Row>
          </ShadowCard>
        </Col>
      )}
      {introductionList && (
        <Col span={24}>
          <Row gutter={[16, 16]}>
            {introductionList.map((des) => (
              <Col {...colProps2} key={des.id}>
                <IntroductionPage {...des} />
              </Col>
            ))}
          </Row>
        </Col>
      )}
      {tabelList && (
        <Col span={24}>
          <Row gutter={[16, 16]}>
            {tabelList.map(({ colProps, ...props }, index) => (
              <Col key={index} {...colProps}>
                <Table {...props} />
              </Col>
            ))}
          </Row>
        </Col>
      )}
    </Row>
  );
};
