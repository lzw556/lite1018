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
  const colProps = generateColProps({ md: 12, lg: 12, xl: 6, xxl: 6 });
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
              {chartList.map(({ colProps, options, title, style }, index) => (
                <React.Fragment key={index}>
                  {options && (
                    <Col {...colProps}>
                      <ChartContainer title={title} options={options} style={style} />
                    </Col>
                  )}
                </React.Fragment>
              ))}
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
