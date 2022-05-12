import { Col, Row, Statistic, Table } from 'antd';
import * as React from 'react';
import ShadowCard from '../../components/shadowCard';
import { ChartContainer } from './charts/chartContainer';
import './home.css';
import { IntroductionPage } from './introductionPage';
import { Overview } from './props';

export const OverviewPage: React.FC<Overview> = (props) => {
  const { properties, chartList, introductionList, tabelList } = props;
  const colProps = {
    xs: { span: 24 },
    sm: { span: 24 },
    md: { span: 12 },
    xl: { span: 6 },
    xxl: { span: 6 }
  };
  const colProps2 = {
    xs: { span: 24 },
    sm: { span: 24 },
    md: { span: 12 },
    xl: { span: 8 },
    xxl: { span: 6 }
  };

  return (
    <Row gutter={[0, 16]}>
      {properties && (
        <Col span={24}>
          <ShadowCard>
            <Row>
              {properties.map(({ name, value }, index) => (
                <Col span={4} key={index} {...colProps}>
                  <Statistic title={name} value={value} />
                </Col>
              ))}
            </Row>
          </ShadowCard>
        </Col>
      )}
      <Col span={24}>
        <ShadowCard>
          <Row>
            {chartList.map(({ colProps, options, title, style }, index) => (
              <Col {...colProps} key={index}>
                <ChartContainer title={title} options={options} style={style} />
              </Col>
            ))}
          </Row>
        </ShadowCard>
      </Col>
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
